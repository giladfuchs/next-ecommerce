import { ecommercePlugin } from "@payloadcms/plugin-ecommerce";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { Plugin } from "payload";

import { Products, Transactions, Variants, Orders } from "@/lib/collections";
import { isAdmin } from "@/lib/collections/base-fields";
import appConfig from "@/lib/core/config";

export const plugins: Plugin[] = [
  vercelBlobStorage({
    enabled: !!appConfig.BLOB_TOKEN,
    token: appConfig.BLOB_TOKEN,
    collections: {
      media: {
        prefix: appConfig.BUCKET_PREFIX,
        ...(appConfig.BLOB_URL ? { disablePayloadAccessControl: true } : {}),
      },
    },
  }),
  ecommercePlugin({
    access: {
      isAdmin,
      adminOnlyFieldAccess: isAdmin,
      isDocumentOwner: isAdmin,
      adminOrPublishedStatus: ({ req: { user } }) => {
        if (user) {
          return true;
        }
        return {
          _status: {
            equals: "published",
          },
        };
      },
    },
    customers: { slug: "users" },
    products: {
      productsCollectionOverride: Products,
      variants: {
        variantsCollectionOverride: Variants,
      },
    },

    orders: { ordersCollectionOverride: Orders },
    transactions: { transactionsCollectionOverride: Transactions },
  }),
];
