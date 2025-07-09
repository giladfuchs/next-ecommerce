import { Metadata } from "next";
import {
  getCategoryTitle,
  getCategoryDescription,
} from "lib/assets/i18n/localizedMetadata";
import { baseUrl, ICON_IMAGE_URL, SITE_NAME } from "lib/config";
import { Category, Product } from "lib/types";

export const generateMetadataProduct = (product: Product) => {
  return {
    title: product.title,
    description: product.description,
    alternates: {
      canonical: `${baseUrl}/product/${encodeURIComponent(product.handle)}`,
    },
    openGraph: {
      title: product.title,
      description: product.description,
      url: `${baseUrl}/product/${encodeURIComponent(product.handle)}`,
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
      canonical: `${baseUrl}/category/${encodeURIComponent(category.title)}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/category/${encodeURIComponent(category.title)}`,
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
