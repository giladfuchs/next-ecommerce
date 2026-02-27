import type { CollectionConfig, CollectionAfterChangeHook } from "payload";

import {
  DESCRIPTION_FIELD,
  FAQS_FIELD,
  makeRevalidateHooks,
  makeAdminPreview,
  adminOnlyAccess,
  mixedSlugField,
  normalizeFaqs,
} from "@/lib/collections/base";
import { CollectionName, RoutePath } from "@/lib/core/types/types";

const reorderCategoryPositions: CollectionAfterChangeHook = async ({
  req,
  doc,
  previousDoc,
}) => {
  if ((req as { __skip_category_reorder?: boolean }).__skip_category_reorder)
    return doc;
  (req as { __skip_category_reorder?: boolean }).__skip_category_reorder = true;

  if (!req?.payload || !doc?.id) return doc;
  if (previousDoc?.position === doc.position) return doc;

  const payload = req.payload;

  const allRes = await payload.find({
    collection: RoutePath.category,
    depth: 0,
    pagination: false,
    limit: 1000,
    sort: "position",
    select: { id: true, position: true },
  });

  const all = allRes.docs || [];
  const filtered = all.filter((item) => String(item.id) !== String(doc.id));

  const maxPos = filtered.length + 1;
  const targetPos = Math.max(
    1,
    Math.min((doc.position ?? maxPos) as number, maxPos),
  );

  const next: { id: string; position: number }[] = [];
  let inserted = false;

  for (let i = 0, pos = 1; i <= filtered.length; i++) {
    if (pos === targetPos && !inserted) {
      next.push({ id: String(doc.id), position: pos++ });
      inserted = true;
    }
    if (i < filtered.length)
      next.push({ id: String(filtered[i].id), position: pos++ });
  }

  const currentPosById = new Map<string, number>();
  for (const row of all)
    currentPosById.set(String(row.id), Number(row.position ?? 0));

  const toUpdate = next.filter(
    (row) => currentPosById.get(row.id) !== row.position,
  );
  if (!toUpdate.length) return doc;

  await Promise.all(
    toUpdate.map((row) =>
      payload.update({
        collection: RoutePath.category,
        id: row.id,
        data: { position: row.position },
        depth: 0,
        req,
      }),
    ),
  );

  return doc;
};
export const Category: CollectionConfig = {
  slug: RoutePath.category,
  versions: {
    drafts: true,
  },
  access: {
    ...adminOnlyAccess,
    read: () => true,
  },

  admin: {
    useAsTitle: "title",
    group: "Content",
    defaultColumns: ["title", "position", "slug", "updatedAt"],
    ...makeAdminPreview(RoutePath.category),
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        return normalizeFaqs(data as { faqs?: unknown });
      },
    ],
    afterChange: [
      reorderCategoryPositions,
      ...makeRevalidateHooks(CollectionName.category).afterChange,
    ],
    afterDelete: makeRevalidateHooks(CollectionName.category).afterDelete,
  },
  fields: [
    { name: "title", type: "text", required: true, localized: true },

    {
      name: "position",
      type: "number",
      required: true,
      defaultValue: 0,
      min: 0,
    },
    { name: "image", type: "upload", relationTo: "media", required: true },

    DESCRIPTION_FIELD,
    mixedSlugField(),
    FAQS_FIELD,
  ],
};
