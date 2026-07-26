#!/usr/bin/env node
/**
 * Bulk-import content into Strapi 5 via the REST API.
 *
 * Usage:
 *   STRAPI_URL=http://localhost:4040 STRAPI_API_TOKEN=xxxx \
 *     node scripts/strapi-bulk-import.mjs [dataFile] [--update] [--dry-run]
 *
 *   # or drop a .env next to this repo with STRAPI_URL / STRAPI_API_TOKEN
 *   node scripts/strapi-bulk-import.mjs scripts/import-data.json
 *
 * Flags:
 *   --update    for collection rows, PUT over an existing entry matched by slug
 *               (default: skip rows whose slug already exists — safe re-runs)
 *   --dry-run   print what would happen, send nothing
 *
 * Notes:
 *   - POST auto-publishes in this Strapi 5.46 setup (publishedAt is set on create).
 *   - The API token must have create/update permission (use a Full Access token).
 *   - Media: give any media field the shape { "__file": "./media/logo.png" }
 *     (path relative to the data file). The script uploads it first, then
 *     references the returned file id. Uploads are de-duplicated per run.
 */

import { readFileSync, existsSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { openAsBlob } from 'node:fs';

// ---------------------------------------------------------------- config ----

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const positional = args.filter((a) => !a.startsWith('--'));
const DRY = flags.has('--dry-run');
const UPDATE = flags.has('--update');

const dataFile = resolve(positional[0] ?? 'scripts/import-data.json');
const dataDir = dirname(dataFile);

// Minimal .env loader (only if the vars aren't already in the environment).
if (!process.env.STRAPI_URL || !process.env.STRAPI_API_TOKEN) {
  for (const candidate of ['.env', '../youtop-nest/.env']) {
    if (!existsSync(candidate)) continue;
    for (const line of readFileSync(candidate, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const key = m[1];
      const val = m[2].replace(/^['"]|['"]$/g, '');
      if ((key === 'STRAPI_URL' || key === 'STRAPI_API_TOKEN') && !process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const URL = (process.env.STRAPI_URL || '').replace(/\/$/, '');
const TOKEN = process.env.STRAPI_API_TOKEN || '';
if (!URL || !TOKEN) {
  console.error('Missing STRAPI_URL or STRAPI_API_TOKEN (env or .env).');
  process.exit(1);
}

// Maps a top-level key in the data file to its REST endpoint + kind.
const ENDPOINTS = {
  globalSetting: { path: 'global-setting', kind: 'single' },
  navigation: { path: 'navigation', kind: 'single' },
  jobNews: { path: 'job-news-items', kind: 'collection' },
  jobResults: { path: 'job-results', kind: 'collection' },
  scholarships: { path: 'scholarships', kind: 'collection' },
};

// ---------------------------------------------------------------- http ------

const auth = { Authorization: `Bearer ${TOKEN}` };

async function api(method, path, body) {
  const res = await fetch(`${URL}/api/${path}`, {
    method,
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify({ data: body }) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error?.message || res.statusText;
    throw new Error(`${method} ${path} -> ${res.status} ${msg}`);
  }
  return json.data;
}

// ---------------------------------------------------------------- media -----

const uploadCache = new Map();

async function uploadFile(relPath) {
  if (uploadCache.has(relPath)) return uploadCache.get(relPath);
  const abs = resolve(dataDir, relPath);
  if (DRY) {
    console.log(`   [dry] would upload ${relPath}`);
    uploadCache.set(relPath, 0);
    return 0;
  }
  if (!existsSync(abs)) throw new Error(`media file not found: ${abs}`);
  const form = new FormData();
  form.append('files', await openAsBlob(abs), basename(abs));
  const res = await fetch(`${URL}/api/upload`, { method: 'POST', headers: auth, body: form });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`upload ${relPath} -> ${res.status} ${json?.error?.message || ''}`);
  const id = json[0].id;
  uploadCache.set(relPath, id);
  console.log(`   uploaded ${relPath} -> file id ${id}`);
  return id;
}

// Deep-walk a record, replacing every { __file } with an uploaded media id.
async function resolveMedia(node) {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) node[i] = await resolveMedia(node[i]);
    return node;
  }
  if (node && typeof node === 'object') {
    if (typeof node.__file === 'string') return await uploadFile(node.__file);
    for (const k of Object.keys(node)) node[k] = await resolveMedia(node[k]);
    return node;
  }
  return node;
}

// ---------------------------------------------------------------- writers ---

async function findBySlug(path, slug) {
  // status=draft returns the draft version of EVERY document (published docs
  // have one too), so it is the superset to dedupe against.
  const q = `${path}?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1&status=draft`;
  const data = await api('GET', q);
  return Array.isArray(data) && data.length ? data[0] : null;
}

async function importSingle(key, record) {
  const { path } = ENDPOINTS[key];
  await resolveMedia(record);
  if (DRY) return console.log(`[single] ${path}: would PUT`);
  await api('PUT', path, record);
  console.log(`[single] ${path}: saved`);
}

async function importCollection(key, rows) {
  const { path } = ENDPOINTS[key];
  let created = 0, updated = 0, skipped = 0, failed = 0;
  for (const row of rows) {
    const slug = row.slug;
    try {
      const existing = slug ? await findBySlug(path, slug) : null;
      await resolveMedia(row);

      if (existing && !UPDATE) {
        skipped++;
        console.log(`[${path}] skip "${slug}" (exists)`);
        continue;
      }
      if (DRY) {
        console.log(`[${path}] would ${existing ? 'replace' : 'create'} "${slug ?? row.title}"`);
        continue;
      }
      // Strapi 5 PUT edits only the draft and drops the row out of the published
      // API, which Nest reads. So --update = delete the whole document, then POST
      // fresh (POST auto-publishes). documentId changes, but nothing references it.
      if (existing) {
        await api('DELETE', `${path}/${existing.documentId}`);
        await api('POST', path, row);
        updated++;
        console.log(`[${path}] replaced "${slug}"`);
      } else {
        await api('POST', path, row);
        created++;
        console.log(`[${path}] created "${slug ?? row.title}"`);
      }
    } catch (err) {
      // Isolate per-row failures so one bad entry never aborts the batch.
      failed++;
      console.error(`[${path}] FAILED "${slug ?? row.title}": ${err.message}`);
    }
  }
  console.log(`[${path}] done — created ${created}, updated ${updated}, skipped ${skipped}, failed ${failed}`);
}

// ---------------------------------------------------------------- main ------

const data = JSON.parse(readFileSync(dataFile, 'utf8'));
console.log(`Target: ${URL}  |  data: ${dataFile}  |  ${DRY ? 'DRY-RUN' : 'LIVE'}${UPDATE ? ' --update' : ''}\n`);

for (const [key, value] of Object.entries(data)) {
  const ep = ENDPOINTS[key];
  if (!ep) {
    console.warn(`(skip unknown key "${key}")`);
    continue;
  }
  try {
    if (ep.kind === 'single') await importSingle(key, value);
    else await importCollection(key, value);
  } catch (err) {
    console.error(`ERROR in "${key}": ${err.message}`);
  }
}
console.log('\nDone.');
