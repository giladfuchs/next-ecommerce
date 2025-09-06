import { Metadata } from "next";
import {
  getCategoryTitle,
  getCategoryDescription,
  metadata_site_description,
  metadata_site_title,
  metadata_keywords,
} from "@/lib/assets/i18n/localizedMetadata";
import {
  baseUrl,
  GOOGLE_SITE_VERIFICATION,
  ICON_IMAGE_URL,
  SITE_NAME,
} from "@/lib/config";
import { Category, ModelType, Product } from "@/lib/types";
export const generateMetadataHome = (): Metadata => {
  return {
    title: metadata_site_title,
    description: metadata_site_description,
    keywords: metadata_keywords,
    openGraph: {
      title: metadata_site_title,
      description: metadata_site_description,
      images: [ICON_IMAGE_URL as string],
      url: baseUrl,
      type: "website",
    },
    alternates: {
      canonical: baseUrl,
    },
  };
};
export const generateMetadataLayout = (): Metadata => {
  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: SITE_NAME!,
      template: `%s | ${SITE_NAME}`,
    },
    description: metadata_site_description,
    robots: {
      follow: true,
      index: true,
      "max-image-preview": "large",
    },
    openGraph: {
      title: SITE_NAME!,
      description: metadata_site_description,
      url: baseUrl,
      siteName: SITE_NAME!,
      images: [
        {
          url: ICON_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: metadata_site_title,
        },
      ],
      locale: "he_IL",
      type: "website",
    },
    verification: {
      google: GOOGLE_SITE_VERIFICATION,
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

export const generateMetadataProduct = (product: Product) => {
  return {
    title: product.title,
    description: product.description,
    alternates: {
      canonical: `${baseUrl}/${ModelType.product}/${encodeURIComponent(product.handle)}`,
    },
    openGraph: {
      title: product.title,
      description: product.description,
      url: `${baseUrl}/${ModelType.product}/${encodeURIComponent(product.handle)}`,
      images: [
        {
          url: product.featuredImage.url,
          width: 1200,
          height: 630,
          alt: product.featuredImage.altText || product.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.description,
      images: [product.featuredImage.url],
    },
  };
};
export const generateMetadataCategory = (category: Category): Metadata => {
  const title = getCategoryTitle(category.title);
  const description = getCategoryDescription(category.title);

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${ModelType.category}/${encodeURIComponent(category.title)}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${ModelType.category}/${encodeURIComponent(category.title)}`,
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: ICON_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "he_IL",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ICON_IMAGE_URL],
    },
  };
};
