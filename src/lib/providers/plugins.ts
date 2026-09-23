import { ecommercePlugin } from "@payloadcms/plugin-ecommerce";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { s3Storage } from "@payloadcms/storage-s3";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";

import type { Category, Page, Product } from "@/payload-types";
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
import { CollectionName, RoutePath } from "@/lib/core/types/types";
import { adminTranslationsPlugin } from "@/lib/intl/admin";

type SeoDocument = Page | Product | Category;

const generateTitle: GenerateTitle<SeoDocument> = ({ doc }) =>
  doc?.title ? `${doc.title} | ${appConfig.SITE_NAME}` : appConfig.SITE_NAME;

const generateURL: GenerateURL<SeoDocument> = ({ collectionSlug, doc }) => {
  if (!doc?.slug) {
    return appConfig.BASE_URL;
  }

  const slug = encodeURIComponent(doc.slug);

  if (collectionSlug === CollectionName.products) {
    return `${appConfig.BASE_URL}/${RoutePath.product}/${slug}`;
  }

  if (collectionSlug === CollectionName.category) {
    return `${appConfig.BASE_URL}/${RoutePath.category}/${slug}`;
  }

  if (doc.slug === appConfig.HOME_SLUG) {
    return appConfig.BASE_URL;
  }

  return `${appConfig.BASE_URL}/${slug}`;
};

let storagePlugin: Plugin | undefined;

const uploadCollections = ["media", "seo-media", "gallery-media"] as const;
type UploadCollection = (typeof uploadCollections)[number];

const createStorageCollections = <T>(
  getOptions: (collection: UploadCollection) => T,
): Record<UploadCollection, T> =>
  Object.fromEntries(
    uploadCollections.map((collection) => [collection, getOptions(collection)]),
  ) as Record<UploadCollection, T>;

const storagePrefix = (collection: UploadCollection) =>
  `${appConfig.BUCKET_PREFIX}/${collection}`;

if (appConfig.STORAGE_PROVIDER === "vercel") {
  storagePlugin = vercelBlobStorage({
    enabled: !!appConfig.BLOB_TOKEN,
    token: appConfig.BLOB_TOKEN,
    addRandomSuffix: true,
    collections: createStorageCollections((collection) => ({
      prefix: storagePrefix(collection),
      ...(appConfig.STORAGE_URL ? { disablePayloadAccessControl: true } : {}),
    })),
  });
} else if (appConfig.STORAGE_PROVIDER === "s3") {
  storagePlugin = s3Storage({
    collections: createStorageCollections((collection) => ({
      disableLocalStorage: true,
      disablePayloadAccessControl: true,
      prefix: storagePrefix(collection),
      generateFileURL: ({ filename, prefix }) => {
        const key = prefix ? `${prefix}/${filename}` : filename;
        return `${appConfig.STORAGE_URL}/${key}`;
      },
    })),
    bucket: appConfig.S3_BUCKET,
    config: {
      endpoint: appConfig.S3_ENDPOINT,
      region: "auto",
      credentials: {
        accessKeyId: appConfig.S3_ACCESS_KEY_ID,
        secretAccessKey: appConfig.S3_SECRET_ACCESS_KEY,
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
  adminTranslationsPlugin,
];
