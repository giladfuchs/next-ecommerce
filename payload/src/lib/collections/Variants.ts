import type { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";
import type { Field } from "payload";

import { adminOnlyAccess, patchPricesGroupField } from "@/lib/collections/base";

export const Variants: CollectionOverride = ({ defaultCollection }) => {
  const fields = (defaultCollection.fields ?? []).map((f): Field => {
    if (f.type !== "group") return f;
    return patchPricesGroupField(f);
  });

  return {
    ...defaultCollection,
    access: adminOnlyAccess,
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
