import { ecommercePlugin } from "@payloadcms/plugin-ecommerce";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { Plugin } from "payload";

import { Products, Transactions, Variants, Orders } from "@/lib/collections";
import appConfig from "@/lib/core/config";
import { isAdmin } from "@/lib/core/util";

export const plugins: Plugin[] = [
  vercelBlobStorage({
    token: appConfig.BLOB_READ_WRITE_TOKEN,
    collections: {
      media: {
        prefix: "payload_ecommerce",
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
