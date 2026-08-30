import type { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";

export const VariantOptions: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  fields: [
    ...(defaultCollection.fields ?? []),
    {
      name: "swatch",
      type: "text",
      label: "Color / swatch",
      admin: {
        description:
          "Pick a preset or choose any custom color. You can also enter a CSS color or gradient. Used when the variant type is displayed as color swatches.",
        placeholder: "#3B82F6",
        components: {
          Field: "@/components/admin/color-picker-field#ColorPickerField",
        },
      },
    },
  ],
});
