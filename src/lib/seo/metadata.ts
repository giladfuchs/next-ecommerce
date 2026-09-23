import type { Page } from "@/lib/core/types/payload-types";
import type { Metadata } from "next";

import appConfig from "@/lib/core/config";
import { CollectionName, RoutePath } from "@/lib/core/types/types";
import { resolveMediaUrl } from "@/lib/core/util";

export const generateMetadataLayout = (): Metadata => {
  return {
    metadataBase: new URL(appConfig.BASE_URL),
    openGraph: { siteName: appConfig.SITE_NAME },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
    verification: {
      google: appConfig.GOOGLE_SITE_VERIFICATION,
    },
    icons: {
      icon: [
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
      other: {
        rel: "manifest",
        url: "/site.webmanifest",
      },
    },
  };
};

type MetadataModel = Pick<Page, "meta">;

const routeByCollection: Record<CollectionName, string> = {
  [CollectionName.pages]: "",
  [CollectionName.products]: RoutePath.product,
  [CollectionName.category]: RoutePath.category,
};

export const buildMetadataByModel = (
  collection: CollectionName,
  model: MetadataModel,
  slug: string,
): Metadata => {
  const { title, description, image: imageRelation } = model.meta;

  if (!title) {
    return {
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const prefix = routeByCollection[collection];
  const path =
    collection === CollectionName.pages && slug === appConfig.HOME_SLUG
      ? ""
      : `${prefix ? `${prefix}/` : ""}${encodeURIComponent(slug)}`;
  const url = new URL(path, new URL("/", appConfig.BASE_URL)).toString();
  const image =
    typeof imageRelation === "object" && imageRelation !== null
      ? imageRelation
      : null;
  const imageUrl = image?.url ? resolveMediaUrl(image, "og") : undefined;

  return {
    title,
    description,
    twitter: {
      title,
      description,
      card: "summary_large_image",
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
    openGraph: {
      title,
      description,
      url,
      ...(imageUrl
        ? {
            images: [
              {
                url: imageUrl,
                width: 1200,
                height: 630,
                ...(image?.alt ? { alt: image.alt } : {}),
              },
            ],
          }
        : {}),
    },
    alternates: {
      canonical: url,
    },
  };
};
