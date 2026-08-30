import type { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";

export const VariantTypes: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  fields: [
    ...(defaultCollection.fields ?? []),
    {
      name: "selectorStyle",
      type: "select",
      required: true,
      options: [
        { label: "Color swatches", value: "swatch" },
        { label: "Buttons", value: "buttons" },
        { label: "Dropdown", value: "select" },
      ],
      admin: {
        description: "Choose how this variant type appears in the storefront.",
      },
    },
  ],
});
