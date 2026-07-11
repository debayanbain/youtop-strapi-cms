import { errors } from '@strapi/utils';

const { ApplicationError } = errors;

const UID = 'api::products.products';
const MESSAGE = 'A product cannot be published without a thumbnail image.';

/**
 * Enforces that every published product has a thumbnail — the seam that stops
 * the frontend ever receiving an empty image `src`. Drafts may be saved without
 * one; the guard only fires when the write publishes the entry.
 *
 * Backs up the schema's `required: true` on `thumbnail`, whose native
 * enforcement for media fields has historically been inconsistent across Strapi
 * releases.
 */

function hasThumbnail(value: unknown): boolean {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'number' || typeof value === 'string') return true;
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    if (Array.isArray(v.connect)) return v.connect.length > 0;
    if (Array.isArray(v.set)) return v.set.length > 0;
    if (v.id != null) return true;
  }
  return false;
}

async function storedHasThumbnail(id: unknown): Promise<boolean> {
  if (id == null) return false;
  const row = await strapi.db.query(UID).findOne({
    where: { id },
    populate: { thumbnail: true },
  });
  return Boolean(row?.thumbnail);
}

async function assertThumbnailOnPublish(event: {
  params: { data?: Record<string, unknown>; where?: { id?: unknown } };
}): Promise<void> {
  const { data, where } = event.params;
  // Only guard publishes; drafts are allowed without a thumbnail.
  if (!data?.publishedAt) return;
  if (hasThumbnail(data.thumbnail)) return;
  // Not in the payload — fall back to the currently stored value.
  if (await storedHasThumbnail(where?.id)) return;
  throw new ApplicationError(MESSAGE);
}

export default {
  async beforeCreate(event: Parameters<typeof assertThumbnailOnPublish>[0]) {
    await assertThumbnailOnPublish(event);
  },
  async beforeUpdate(event: Parameters<typeof assertThumbnailOnPublish>[0]) {
    await assertThumbnailOnPublish(event);
  },
};
