import { SITE_NAME } from "../../config";
import { localeCache } from "../../api";

export const metadata_site_title = `${SITE_NAME} - NextJs`;
export const metadata_site_description =
  "Modern e-commerce template with storefront and admin panel — built with Next.js for any product-based business.";

export const metadata_keywords = [
  "ecommerce template",
  "nextjs",
  "typescript",
  "storefront",
  "admin dashboard",
  "online store",
  "headless commerce",
  SITE_NAME ?? "Next.js E-commerce",
];

export function getCategoryTitle(
  categoryTitle: string,
  query?: string,
): string {
  if (localeCache.get() === "en") {
    return query
      ? `Search results for "${query}" in category ${categoryTitle} | ${SITE_NAME}`
      : `${categoryTitle} | ${SITE_NAME}`;
  }

  return query
    ? `תוצאות חיפוש עבור "${query}" בקטגוריית ${categoryTitle} | ${SITE_NAME}`
    : `${categoryTitle} | ${SITE_NAME}`;
}

export function getCategoryDescription(
  categoryTitle: string,
  query?: string,
): string {
  if (localeCache.get() === "en") {
    return query
      ? `Products matching "${query}" in category ${categoryTitle}`
      : `Category ${categoryTitle} – a curated selection of products`;
  }

  return query
    ? `מוצרים תואמים ל"${query}" בקטגוריית ${categoryTitle}`
    : `קטגוריית ${categoryTitle} - מבחר מוצרים ייחודיים`;
}
