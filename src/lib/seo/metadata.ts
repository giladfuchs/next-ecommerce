import type { Category, Media } from "@/lib/core/types/payload-types";
import type { Metadata } from "next";

import appConfig from "@/lib/core/config";
import {
  RoutePath,
  type MetaInput,
  type ProductSinglePage,
} from "@/lib/core/types/types";
import { extractRichTextText, resolveMediaUrl } from "@/lib/core/util";

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

export const buildMetadata = ({
  title,
  description,
  image,
  path,
  modifiedTime,
}: MetaInput): Metadata => {
  if (!title) {
    return {
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const url = `${appConfig.BASE_URL}/${path}`;
  const imageUrl = resolveMediaUrl(image);

  return {
    title,
    description,
    twitter: {
      title,
      description,
      images: [imageUrl],
      card: "summary_large_image",
    },
    openGraph: {
      title,
      description,
      url,
      ...(modifiedTime && {
        type: "article",
        modifiedTime,
      }),
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
        },
      ],
    },
    alternates: {
      canonical: url,
    },
  };
};

export function generateMetadataProduct(
  product: ProductSinglePage,
  slug: string,
): Metadata {
  const url = `${appConfig.BASE_URL}/${RoutePath.product}/${encodeURIComponent(slug)}`;
  const title = product.title;
  const description = extractRichTextText(product.description);

  const image = product.gallery![0].image as Media;
  const imageUrl = resolveMediaUrl(image);

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
  const url = `${appConfig.BASE_URL}/${RoutePath.category}/${encodeURIComponent(category.slug)}`;
  const title = category.title;
  const description = extractRichTextText(category.description);

  const image = category.image as Media;
  const imageUrl = resolveMediaUrl(image);

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
