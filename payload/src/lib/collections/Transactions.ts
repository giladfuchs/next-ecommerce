import type { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";

export const Transactions: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  access: {
    ...(defaultCollection.access || {}),
    read: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  admin: {
    ...(defaultCollection.admin || {}),
    hidden: true,
  },
});
