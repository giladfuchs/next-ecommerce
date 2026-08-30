import type { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";
import type { Field } from "payload";

import {
  adminOnlyAccess,
  patchPricesGroupField,
} from "@/lib/collections/base-fields";

export const Variants: CollectionOverride = ({ defaultCollection }) => {
  const fields = (defaultCollection.fields ?? []).map((f): Field => {
    if (f.type === "group") return patchPricesGroupField(f, false);

    const name = "name" in f ? f.name : undefined;
    if (name === "options") {
      return {
        ...f,
        admin: {
          ...f.admin,
          description:
            "Choose one option from every variant type enabled on the product.",
        },
      } as Field;
    }

    if (name === "inventory") {
      return {
        ...f,
        required: true,
        admin: {
          ...f.admin,
          description:
            "Inventory for this exact combination. Set to 0 to disable it in the storefront.",
        },
      } as Field;
    }

    return f;
  });

  fields.push({
    name: "originalPriceInUSD",
    type: "number",
    min: 0,
    admin: {
      description:
        "Original price before discount (optional). Shown as a strikethrough price when set.",
      condition: (data) => Boolean(data?.priceInUSDEnabled),
    },
  });

  return {
    ...defaultCollection,
    access: {
      ...adminOnlyAccess,
      read: () => true,
    },
    admin: {
      ...(defaultCollection.admin ?? {}),
      defaultColumns: Array.from(
        new Set([
          ...(defaultCollection.admin?.defaultColumns ?? []),
          "priceInUSD",
          "inventory",
        ]),
      ),
    },
    fields,
  };
};
