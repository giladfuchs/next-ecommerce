import { MetadataRoute } from "next";

import appConfig from "@/lib/core/config";
import Queries from "@/lib/core/queries";
import { CollectionSlug } from "@/lib/core/types/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, categories } = await Queries.querySitemapData();

  return [
    {
      url: `${appConfig.BASE_URL}/`,
      lastModified: products[0]?.updatedAt,
    },
    ...categories.map((category) => ({
      url: `${appConfig.BASE_URL}/${CollectionSlug.category}/${encodeURIComponent(category.slug)}`,
      lastModified: category.updatedAt,
    })),
    ...products.map((product) => ({
      url: `${appConfig.BASE_URL}/${CollectionSlug.product}/${encodeURIComponent(product.slug)}`,
      lastModified: product.updatedAt,
    })),
  ];
}
