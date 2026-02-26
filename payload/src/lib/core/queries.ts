import configPromise from "@payload-config";
import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";
import { getPayload as initPayload } from "payload";

import type {
  Category,
  Media,
  Product,
  SiteSetting,
} from "@/lib/core/types/payload-types";

import { buildProductPurchaseSectionData } from "@/lib/core/adapter";
import { CollectionSlug, type ProductSinglePage } from "@/lib/core/types/types";
type CollectionName = "products" | CollectionSlug.category;

export default class Queries {
  private static _instance: Awaited<ReturnType<typeof initPayload>> | null =
    null;

  static async getPayload() {
    if (!Queries._instance) {
      Queries._instance = await initPayload({ config: configPromise });
    }
    return Queries._instance;
  }

  static cache<T>(fn: () => Promise<T>, keys: string[], tags: string[]) {
    return unstable_cache(fn, keys, { revalidate: false, tags });
  }
  private static async queryBySlug<T>(
    collection: CollectionName,
    slug: string,
    depth: number,
    select?: Record<string, true>,
  ): Promise<T | null> {
    const { isEnabled: draft } = await draftMode();
    const payload = await Queries.getPayload();

    const res = await payload.find({
      collection,
      depth,
      draft,
      overrideAccess: draft,
      limit: 1,
      pagination: false,
      where: {
        and: [
          { slug: { equals: slug } },
          ...(draft ? [] : [{ _status: { equals: "published" } }]),
        ],
      },
      ...(select ? { select } : {}),
    });

    return (res.docs?.[0] as T) ?? null;
  }

  static queryProductBySlug(slug: string): Promise<ProductSinglePage | null> {
    return Queries.cache<ProductSinglePage | null>(
      async () => {
        const product = await this.queryBySlug<Product>("products", slug, 2, {
          title: true,
          description: true,
          updatedAt: true,
          gallery: true,
          priceInUSD: true,
          inventory: true,
          variants: {
            inventory: true,
            priceInUSD: true,
          }as unknown as true,
          variantTypes: true,
        });
        if (!product) return null;
        return {
          title: product.title,
          description: product.description,
          updatedAt: product.updatedAt,
          gallery: product.gallery,
          purchase_section: buildProductPurchaseSectionData(product),
        };
      },
      [`${CollectionSlug.product}-${slug}`],
      [`${CollectionSlug.product}-${slug}`],
    )();
  }

  static queryCategoryBySlug(slug: string): Promise<Category | null> {
    return Queries.cache<Category | null>(
      () =>
        this.queryBySlug<Category>(CollectionSlug.category, slug, 1, {
          id: true,
          title: true,
          image: true,
          slug: true,
          description: true,
          updatedAt: true,
        }),
      [`${CollectionSlug.category}-${slug}`],
      [`${CollectionSlug.category}-${slug}`],
    )();
  }
  static queryAllProducts(): Promise<Product[]> {
    return Queries.cache(
      async () => {
        const payload = await Queries.getPayload();

        const res = await payload.find({
          collection: `${CollectionSlug.product}s`,
          draft: false,
          overrideAccess: false,
          limit: 0,
          pagination: false,
          sort: "-updatedAt",
          depth: 0,
          where: { _status: { equals: "published" } },
          select: {
            title: true,
            slug: true,
            gallery: true,
            categories: true,
            priceInUSD: true,
          },
        });

        const products = res.docs as Product[];

        const firstImageIds = Array.from(
          new Set(products.map((p) => p.gallery![0].image as number)),
        );

        const mediaRes = await payload.find({
          collection: "media",
          depth: 0,
          limit: 0,
          pagination: false,
          where: { id: { in: firstImageIds } },
        });

        const mediaById = new Map<number, Media>();
        for (const m of mediaRes.docs) {
          mediaById.set(Number(m.id), m as Media);
        }

        return products.map((p) => ({
          ...p,
          gallery: [
            { image: mediaById.get(p.gallery![0].image as number) as Media },
          ] as Product["gallery"],
        })) as Product[];
      },
      [`bootstrap-${CollectionSlug.product}`],
      ["bootstrap"],
    )();
  }

  private static async fetchSlugs(
    collection: CollectionName,
  ): Promise<{ slug: string; updatedAt: string }[]> {
    const payload = await Queries.getPayload();

    const res = await payload.find({
      collection,
      draft: false,
      overrideAccess: false,
      limit: 0,
      pagination: false,
      sort: "-updatedAt",
      depth: 0,
      where: {
        _status: { equals: "published" },
      },
      select: { slug: true, updatedAt: true },
    });

    return res.docs as { slug: string; updatedAt: string }[];
  }

  static querySitemapData() {
    return Queries.cache(
      async () => {
        const [products, categories] = await Promise.all([
          Queries.fetchSlugs("products"),
          Queries.fetchSlugs(CollectionSlug.category),
        ]);
        return { products, categories };
      },
      ["bootstrap-sitemap"],
      ["bootstrap"],
    )();
  }

  private static _cachedSiteSettings = Queries.cache(
    async () => {
      const payload = await Queries.getPayload();
      return await payload.findGlobal({
        slug: "site-settings",
        depth: 2,
      });
    },
    ["bootstrap-settings"],
    ["bootstrap"],
  );

  static querySiteSettings(): Promise<SiteSetting> {
    return Queries._cachedSiteSettings();
  }

  static queryCategoriesBasic(): Promise<Category[]> {
    return Queries.cache(
      async () => {
        const payload = await Queries.getPayload();

        const res = await payload.find({
          collection: CollectionSlug.category,
          depth: 0,
          limit: 0,
          pagination: false,
          sort: "position",
          where: {
            _status: { equals: "published" },
          },
          select: {
            id: true,
            title: true,
            slug: true,
          },
        });
        return res.docs;
      },
      [`bootstrap-${CollectionSlug.category}`],
      ["bootstrap"],
    )();
  }
}
