import type { MetadataRoute } from "next";

import appConfig from "@/lib/core/config";
import DAL from "@/lib/core/dal";
import { RoutePath } from "@/lib/core/types/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const { products, categories, pages } = await DAL.querySitemapData();

    const result: MetadataRoute.Sitemap = [];
    const home = pages.find((page) => page.slug === appConfig.HOME_SLUG);

    if (home) {
      result.push({
        url: `${appConfig.BASE_URL}/`,
        lastModified: home.updatedAt,
      });
    }

    result.push(
      ...pages
        .filter((page) => page.slug !== appConfig.HOME_SLUG)
        .map((page) => ({
          url: `${appConfig.BASE_URL}/${encodeURIComponent(page.slug)}`,
          lastModified: page.updatedAt,
        })),
      ...categories.map((category) => ({
        url: `${appConfig.BASE_URL}/${RoutePath.category}/${encodeURIComponent(category.slug)}`,
        lastModified: category.updatedAt,
      })),
      ...products.map((product) => ({
        url: `${appConfig.BASE_URL}/${RoutePath.product}/${encodeURIComponent(product.slug)}`,
        lastModified: product.updatedAt,
      })),
    );

    return result;
  } catch {
    return [];
  }
}
