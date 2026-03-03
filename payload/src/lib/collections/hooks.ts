import { revalidateTag } from "next/cache";
import sharp from "sharp";

import type { Product } from "@/lib/core/types/payload-types";
import type {
  PayloadRequest,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
} from "payload";

import { CollectionName } from "@/lib/core/types/types";

export const normalizeFaqs = <T extends { faqs?: unknown }>(
  data: T | undefined | null,
) => {
  if (!data) return data;
  const faqs = data.faqs as Product["faqs"];

  if (Array.isArray(faqs)) {
    const filteredFaqs = faqs.filter((item) => {
      if (!item) return false;
      return Boolean(item.question) || Boolean(item.answer);
    });

    data.faqs = filteredFaqs.length ? filteredFaqs : undefined;
  }

  return data;
};

export function makeRevalidateHooks(collection: CollectionName): {
  afterChange: CollectionAfterChangeHook[];
  afterDelete: CollectionAfterDeleteHook[];
} {
  return {
    afterChange: [
      async ({ doc, previousDoc }) => {
        try {
          const newSlug = doc?.slug ? String(doc.slug) : "";
          const prevSlug = previousDoc?.slug ? String(previousDoc.slug) : "";

          if (prevSlug) revalidateTag(`${collection}-${prevSlug}`, "max");
          if (newSlug) revalidateTag(`${collection}-${newSlug}`, "max");
        } catch {}
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        try {
          const slug = doc?.slug ? String(doc.slug) : "";
          if (slug) revalidateTag(`${collection}-${slug}`, "max");
        } catch {}
      },
    ],
  };
}

export const reorderCategoryPositions: CollectionAfterChangeHook = async ({
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
    collection: CollectionName.category,
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
        collection: CollectionName.category,
        id: row.id,
        data: { position: row.position },
        depth: 0,
        req,
      }),
    ),
  );

  return doc;
};

type UploadFile = {
  data?: object;
  mimetype?: string;
  type?: string;
  size?: number;
  filename?: string;
  originalname?: string;
  name?: string;
};

type CloudContext = {
  _payloadCloudStorage?: {
    file?: UploadFile;
  };
};

export const mediaTransformUploadHook: CollectionBeforeChangeHook = async ({
  req,
  operation,
  data,
}) => {
  if (operation !== "create" && operation !== "update") return;

  const typedReq = req as PayloadRequest & {
    file?: UploadFile;
    context?: CloudContext;
  };

  const file = typedReq.file ?? typedReq.context?._payloadCloudStorage?.file;

  if (!file?.data) return;

  const mime = file.mimetype || file.type || "";
  if (!mime.startsWith("image/") || mime === "image/webp") return;

  const inputName = file.filename || file.originalname || file.name || "image";

  const baseName = inputName.replace(/\.[^/.]+$/, "");
  const webpName = `${baseName}-${Math.random().toString(36).slice(2, 4)}.webp`;

  const out = await sharp(file.data)
    .rotate()
    .resize({ width: 850, withoutEnlargement: true })
    .webp({
      quality: 85,
      effort: 6,
    })
    .toBuffer();

  const meta = await sharp(out).metadata();

  const patch = (target?: UploadFile) => {
    if (!target) return;
    target.data = out;
    target.mimetype = "image/webp";
    target.type = "image/webp";
    target.size = out.length;
    target.filename = webpName;
    target.originalname = webpName;
    target.name = webpName;
  };

  patch(typedReq.file);
  patch(typedReq.context?._payloadCloudStorage?.file);

  data.filename = webpName;
  data.mimeType = "image/webp";
  data.filesize = out.length;
  data.width = meta.width;
  data.height = meta.height;
};
