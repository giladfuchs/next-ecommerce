import type { Product } from "@/lib/core/types/payload-types";
import type { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";
import type { Field } from "payload";

import {
  DESCRIPTION_FIELD,
  FAQS_FIELD,
  adminOnlyAccess,
  makeAdminPreview,
  patchPricesGroupField,
  mixedSlugField,
} from "@/lib/collections/base-fields";
import { normalizeFaqs, makeRevalidateHooks } from "@/lib/collections/hooks";
import { CollectionName, RoutePath } from "@/lib/core/types/types";

export const Products: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,

  access: {
    ...adminOnlyAccess,
    read: () => true,
  },

  admin: {
    ...defaultCollection?.admin,
    defaultColumns: ["title", "enableVariants", "_status", "variants.variants"],
    ...makeAdminPreview(RoutePath.product),
    useAsTitle: "title",
  },

  hooks: {
    ...makeRevalidateHooks(CollectionName.products),

    beforeValidate: [
      ({ data }) => {
        if (!data) return data;

        const gallery = data.gallery as Product["gallery"] | undefined;
        if (!gallery) return data;

        const filtered = gallery.filter(
          (item): item is NonNullable<Product["gallery"]>[number] =>
            Boolean(item) && item.image !== null,
        );

        data.gallery = filtered.length ? filtered : [{ image: null }];
        data.image = data.gallery[0].image;
        return normalizeFaqs(data);
      },
    ],
  },

  fields: [
    { name: "title", type: "text", required: true, localized: true },

    {
      name: "categories",
      type: "relationship",
      admin: { position: "sidebar", sortOptions: "title" },
      hasMany: true,
      relationTo: CollectionName.category,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: { hidden: true },
    },

    mixedSlugField(),
    ...((defaultCollection.fields || []) as Field[])
      .filter((f) => (f as { name?: string }).name !== "layout")
      .map((f) => {
        const g = f as Field & { admin?: { description?: string } };
        if (
          g.type === "group" &&
          g.admin?.description ===
            "Prices for this product in different currencies."
        ) {
          return patchPricesGroupField(g);
        }
        return f;
      }),

    DESCRIPTION_FIELD,

    {
      name: "gallery",
      type: "array",
      minRows: 1,
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
      ],
    },

    {
      name: "relatedProducts",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      filterOptions: ({ id }) => ({
        id: id ? { not_in: [id] } : { exists: true },
      }),
    },
    FAQS_FIELD,
    {
      name: "reviews",
      type: "join",
      collection: "reviews",
      on: "product",
    },
  ],
});
