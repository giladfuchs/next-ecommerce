import type { CollectionConfig, PayloadRequest } from "payload";

import { adminOnlyAccess } from "@/lib/collections/base-fields";
import { revalidate } from "@/lib/collections/hooks";
import { CollectionName } from "@/lib/core/types/types";

const revalidateProductFromReview = async (
  doc: { product?: number | { id?: number } | null },
  req: PayloadRequest,
) => {
  const productId =
    typeof doc.product === "object" ? doc.product?.id : doc.product;
  if (!productId) return;

  try {
    const product = await req.payload.findByID({
      collection: CollectionName.products,
      id: productId,
      depth: 0,
      select: { slug: true },
    });
    revalidate(`${CollectionName.products}-${product.slug}`);
  } catch {}
};

export const Reviews: CollectionConfig = {
  slug: "reviews",
  access: {
    ...adminOnlyAccess,
    read: () => true,
    create: () => true,
  },
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        await revalidateProductFromReview(doc, req);
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await revalidateProductFromReview(doc, req);
      },
    ],
  },
  admin: {
    useAsTitle: "title",
    group: "Content",
    defaultColumns: ["title", "product", "rating", "authorName", "createdAt"],
  },
  fields: [
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
      index: true,
    },
    { name: "authorName", type: "text", required: true },
    {
      name: "authorEmail",
      type: "email",
      access: {
        read: ({ req }) => Boolean(req.user),
      },
    },
    { name: "title", type: "text", required: true },
    { name: "body", type: "textarea", required: true },
    { name: "rating", type: "number", min: 1, max: 5, required: true },
  ],
};
