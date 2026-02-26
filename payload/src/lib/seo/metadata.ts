import type {
  Category,
  Media,
  SiteSetting,
} from "@/lib/core/types/payload-types";
import type { Metadata } from "next";

import appConfig from "@/lib/core/config";
import { CollectionSlug, type ProductSinglePage } from "@/lib/core/types/types";
import { extractRichTextText } from "@/lib/core/util";

export const generateMetadataLayout = (settings: SiteSetting): Metadata => {
  const title = settings.home.title;
  const description = extractRichTextText(settings.home.description);

  const image = settings.home.image_meta as Media;

  return {
    metadataBase: new URL(appConfig.BASE_URL),
    title,
    description,
    robots: {
      follow: true,
      index: true,
      "max-image-preview": "large",
    },
    openGraph: {
      title,
      description,
      url: appConfig.BASE_URL,
      siteName: title,
      images: [
        {
          url: `${appConfig.BASE_URL}${image.url}`,
          width: 1200,
          height: 630,
        },
      ],
      locale: "en_US",
      type: "website",
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
    alternates: {
      canonical: appConfig.BASE_URL,
    },
  };
};

export function generateMetadataProduct(
  product: ProductSinglePage,
  slug: string,
): Metadata {
  const url = `${appConfig.BASE_URL}/${CollectionSlug.product}/${encodeURIComponent(slug)}`;
  const title = product.title;
  const description = extractRichTextText(product.description);

  const image = product.gallery![0].image as Media;
  const imageUrl = `${appConfig.BASE_URL}${image.url}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: imageUrl,
          width: image.width ?? 1200,
          height: image.height ?? 630,
          alt: image.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function generateMetadataCategory(category: Category): Metadata {
  const url = `${appConfig.BASE_URL}/${CollectionSlug.category}/${encodeURIComponent(category.slug)}`;
  const title = category.title;
  const description = extractRichTextText(category.description);

  const image = category.image as Media;
  const imageUrl = `${appConfig.BASE_URL}${image.url}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: imageUrl,
          width: image.width ?? 1200,
          height: image.height ?? 630,
          alt: image.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
