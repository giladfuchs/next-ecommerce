import { revalidateTag } from "next/cache";

import type { CollectionConfig } from "payload";

import { adminOnlyAccess } from "@/lib/collections/base";
import { CollectionName } from "@/lib/core/types/types";

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
        const productId =
          typeof doc.product === "object" ? doc.product.id : doc.product;
        if (!productId) return;

        const product = await req.payload.findByID({
          collection: CollectionName.products,
          id: productId,
          depth: 0,
          select: { slug: true },
        });

        try {
          revalidateTag(`${CollectionName.products}-${product.slug}`, "max");
        } catch {}
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
    { name: "authorEmail", type: "email" },
    { name: "title", type: "text", required: true },
    { name: "body", type: "textarea", required: true },
    { name: "rating", type: "number", min: 1, max: 5, required: true },
  ],
};
