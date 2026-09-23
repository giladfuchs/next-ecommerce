import type { Product } from "@/lib/core/types/payload-types";
import type { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";
import type { Field } from "payload";

import {
  DESCRIPTION_FIELD,
  FAQS_FIELD,
  adminOnlyAccess,
  makeAdminPreview,
  metaTab,
  mixedSlugField,
  patchPricesGroupField,
} from "@/lib/collections/base-fields";
import { makeRevalidateHooks, normalizeFaqs } from "@/lib/collections/hooks";
import { CollectionName, RoutePath } from "@/lib/core/types/types";

const getFieldName = (field: Field) =>
  "name" in field && typeof field.name === "string" ? field.name : undefined;

const isSidebarField = (field: Field) =>
  field.admin && "position" in field.admin
    ? field.admin.position === "sidebar"
    : false;

const enhanceVariantField = (field: Field): Field => {
  const name = getFieldName(field);

  if (name === "enableVariants") {
    return {
      ...field,
      label: "Enable product variants",
      admin: {
        ...field.admin,
        description:
          "Use combinations such as Color + Size. Every combination can have its own inventory and an optional custom price.",
      },
    } as Field;
  }

  if (name === "variantTypes") {
    return {
      ...field,
      admin: {
        ...field.admin,
        description:
          "Choose types in storefront order. Put primary choices such as Color before dependent choices such as Size.",
      },
    } as Field;
  }

  if (name === "variants") {
    return {
      ...field,
      admin: {
        ...field.admin,
        description:
          "Add the combinations you actually sell. Missing combinations are hidden; sold-out combinations stay visible so shoppers can select them and see the sold-out state.",
      },
    } as Field;
  }

  return field;
};

export const Products: CollectionOverride = ({ defaultCollection }) => {
  const pluginFields = ((defaultCollection.fields || []) as Field[])
    .filter((field) => getFieldName(field) !== "layout")
    .map((field) => {
      const group = field as Field & { admin?: { description?: string } };

      if (
        group.type === "group" &&
        group.admin?.description ===
          "Prices for this product in different currencies."
      ) {
        return patchPricesGroupField(group);
      }

      return enhanceVariantField(field);
    });

  const allFields: Field[] = [
    { name: "title", type: "text", required: true, localized: true },
    {
      name: "categories",
      type: "relationship",
      admin: { position: "sidebar", sortOptions: "title" },
      hasMany: true,
      relationTo: CollectionName.category,
    },
    mixedSlugField(),
    ...pluginFields,
    {
      name: "originalPriceInUSD",
      type: "number",
      min: 0,
      admin: {
        description:
          "Original price before discount (optional). Shown as a strikethrough price when set.",
      },
    },
    DESCRIPTION_FIELD,
    {
      name: "gallery",
      type: "array",
      minRows: 1,
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "gallery-media",
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
  ];

  const variantNames = new Set(["enableVariants", "variantTypes", "variants"]);
  const sidebarFields = allFields.filter(isSidebarField);
  const variantFields = allFields.filter((field) =>
    variantNames.has(getFieldName(field) ?? ""),
  );
  const detailsFields = allFields.filter(
    (field) => !sidebarFields.includes(field) && !variantFields.includes(field),
  );

  return {
    ...defaultCollection,
    access: {
      ...adminOnlyAccess,
      read: () => true,
    },
    admin: {
      ...defaultCollection?.admin,
      defaultColumns: [
        "title",
        "enableVariants",
        "_status",
        "variants.variants",
      ],
      ...makeAdminPreview(RoutePath.product),
      useAsTitle: "title",
    },
    hooks: {
      ...makeRevalidateHooks(CollectionName.products),
      beforeValidate: [
        ({ data }) => {
          if (!data) return data;

          const gallery = data.gallery as Product["gallery"] | undefined;
          if (gallery) {
            const filtered = gallery.filter(
              (item): item is NonNullable<Product["gallery"]>[number] =>
                Boolean(item) && item.image !== null,
            );

            data.gallery = filtered.length ? filtered : [{ image: null }];
          }

          return normalizeFaqs(data);
        },
      ],
    },
    fields: [
      ...sidebarFields,
      {
        type: "tabs",
        tabs: [
          {
            label: "Product details",
            fields: detailsFields,
          },
          {
            label: "Variants",
            fields: variantFields,
          },
          metaTab(),
        ],
      },
    ],
  };
};
