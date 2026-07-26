# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **Strapi 5.46.1** (headless CMS) backend in TypeScript, powering the "youtop" site
(products/e-learning + government-job info). It is content-API only — no custom frontend
lives here (React deps exist solely for the Strapi admin panel). Node `>=20 <=24`.

## Commands

```bash
npm run develop     # dev server with autoReload (admin at :1337/admin, API at :1337/api)
npm run start       # prod server, autoReload disabled (run `npm run build` first)
npm run build       # build the admin panel
npm run console     # interactive strapi console (access `strapi` global, db queries)
npm run deploy      # deploy to Strapi Cloud
npm run upgrade     # npx @strapi/upgrade latest  (upgrade:dry for a dry run)
npm run strapi -- generate   # scaffold a new api / content-type / component
```

There is **no lint or test tooling** configured — no test runner, no ESLint. `tsconfig.json`
has `strict: false` but `noEmitOnError: true`, so `npm run build` fails on type errors.

## Architecture

Standard Strapi content-API layout. Each folder under `src/api/<name>/` is one content type
and follows the same four-part shape:

- `content-types/<name>/schema.json` — the data model (source of truth for fields/relations)
- `controllers/<name>.ts`, `routes/<name>.ts`, `services/<name>.ts` — all thin wrappers over
  `factories.createCoreController/Router/Service('api::<name>.<name>')`. **These are boilerplate**;
  only edit them to override default REST behavior. Most work happens in `schema.json`.

Content types split into two `kind`s (set in schema.json):
- **singleType** — one global record: `home-page`, `global-setting`, `navigation`
- **collectionType** — many records: `products`, `job-highlight`, `job-news`, `job-result`,
  `scholarship`, `update`

All content types use `draftAndPublish: true`, so `?status=draft|published` and `publishedAt`
matter on every read/write.

**Components** (reusable field groups) live in `src/components/`, referenced by schemas as
`sections.*` and `shared.*`:
- `sections/` (hero, best-sellers, latest-updates, job-highlights, cta-banner) are the blocks
  of the `home-page` **dynamic zone** (`sections` attribute) — new homepage blocks = new
  `sections.*` component + add it to that dynamic zone's `components` list.
- `shared/` (button, badge, nav-link, social-link, footer-column, source-meta) are cross-cutting.

### Non-obvious details

- **`src/api/products/content-types/products/lifecycles.ts`** is the only custom business logic.
  It blocks publishing a product without a `thumbnail` (drafts allowed), backstopping the media
  field's `required: true` because Strapi's native media-required enforcement is unreliable.
  Any similar invariant belongs in a `lifecycles.ts` next to its schema, not in a controller.
- **`products` schema naming is deliberately irregular**: `singularName: "products"`,
  `pluralName: "products-manage"`, `collectionName: "products_manage"`. So the UID is
  `api::products.products` but the REST route is `/api/products-manage`. Don't "fix" this.
- `src/index.ts` `register`/`bootstrap` hooks are currently empty stubs.

## Configuration (`config/*.ts`)

Config files are functions returning typed `Core.Config.*` objects, all driven by `env(...)`.

- **Database** (`database.ts`): client chosen by `DATABASE_CLIENT` (defaults to `sqlite`;
  `postgres` in real deployments — `pg` is the installed driver). Postgres reads `DATABASE_URL`
  or discrete `DATABASE_*` vars.
- **Uploads** (`plugins.ts`): uses `@strapi/provider-upload-aws-s3` but pointed at a
  **MinIO / S3-compatible** endpoint via `MINIO_*` env vars (`forcePathStyle: true`).
  Assets are served from `https://cdn.oxland.in`.
- **500 MB upload limit** is set in **two places that must stay in sync**: `plugins.ts`
  (`sizeLimit`) and the `strapi::body` middleware in `middlewares.ts` (form/json/text/file limits).
- **CSP** (`middlewares.ts`): `cdn.oxland.in` is explicitly allowlisted for `connect/img/media-src`.
  Add any new asset/CDN host there or the admin/frontend will block it.

Required env vars (see `.env`): `APP_KEYS`, `ADMIN_JWT_SECRET`, `API_TOKEN_SALT`,
`TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY`, `JWT_SECRET`, `DATABASE_*`, `MINIO_*`.
