import { ecommercePlugin } from "@payloadcms/plugin-ecommerce";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { s3Storage } from "@payloadcms/storage-s3";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";

import type { Page } from "@/payload-types";
import type { GenerateTitle, GenerateURL } from "@payloadcms/plugin-seo/types";
import type { Plugin } from "payload";

import {
  Carts,
  Orders,
  Products,
  Transactions,
  VariantOptions,
  Variants,
  VariantTypes,
} from "@/lib/collections";
import { isAdmin } from "@/lib/collections/base-fields";
import appConfig from "@/lib/core/config";

const generateTitle: GenerateTitle<Page> = ({ doc }) =>
  doc?.title ? `${doc.title} | ${appConfig.SITE_NAME}` : appConfig.SITE_NAME;

const generateURL: GenerateURL<Page> = ({ doc }) =>
  doc?.slug
    ? `${appConfig.BASE_URL}/${encodeURIComponent(doc.slug)}`
    : appConfig.BASE_URL;

let storagePlugin: Plugin | undefined;

if (appConfig.STORAGE_PROVIDER === "vercel") {
  storagePlugin = vercelBlobStorage({
    enabled: !!appConfig.BLOB_TOKEN,
    token: appConfig.BLOB_TOKEN,
    addRandomSuffix: true,
    collections: {
      media: {
        prefix: appConfig.BUCKET_PREFIX,
        ...(appConfig.STORAGE_URL ? { disablePayloadAccessControl: true } : {}),
      },
    },
  });
} else if (appConfig.STORAGE_PROVIDER === "s3") {
  storagePlugin = s3Storage({
    collections: {
      media: {
        disableLocalStorage: true,
        disablePayloadAccessControl: true,
        prefix: appConfig.BUCKET_PREFIX,
        generateFileURL: ({ filename, prefix }) => {
          const key = prefix ? `${prefix}/${filename}` : filename;
          return `${appConfig.STORAGE_URL}/${key}`;
        },
      },
    },
    bucket: appConfig.R2_BUCKET,
    config: {
      endpoint: appConfig.R2_ENDPOINT,
      region: "auto",
      credentials: {
        accessKeyId: appConfig.R2_ACCESS_KEY_ID,
        secretAccessKey: appConfig.R2_SECRET_ACCESS_KEY,
      },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
      forcePathStyle: true,
    },
  });
}

export const plugins: Plugin[] = [
  ...(storagePlugin ? [storagePlugin] : []),
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
    carts: { cartsCollectionOverride: Carts },
    products: {
      productsCollectionOverride: Products,
      variants: {
        variantOptionsCollectionOverride: VariantOptions,
        variantsCollectionOverride: Variants,
        variantTypesCollectionOverride: VariantTypes,
      },
    },

    orders: { ordersCollectionOverride: Orders },
    transactions: { transactionsCollectionOverride: Transactions },
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
];
