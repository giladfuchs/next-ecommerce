import { MetadataRoute } from "next";

import appConfig from "@/lib/core/config";
import DAL from "@/lib/core/dal";
import { RoutePath } from "@/lib/core/types/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, categories } = await DAL.querySitemapData();

  return [
    {
      url: `${appConfig.BASE_URL}/`,
      lastModified: products[0]?.updatedAt,
    },
    ...categories.map((category) => ({
      url: `${appConfig.BASE_URL}/${RoutePath.category}/${encodeURIComponent(category.slug)}`,
      lastModified: category.updatedAt,
    })),
    ...products.map((product) => ({
      url: `${appConfig.BASE_URL}/${RoutePath.product}/${encodeURIComponent(product.slug)}`,
      lastModified: product.updatedAt,
    })),
  ];
}
