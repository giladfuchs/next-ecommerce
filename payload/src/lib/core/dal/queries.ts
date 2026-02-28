import configPromise from "@payload-config";
import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";
import { getPayload as initPayload, type PayloadRequest } from "payload";

import type { SitemapData, SitemapItem } from "@/lib/core/dal/type";
import type {
  Category,
  Media,
  Product,
  SiteSetting,
  User,
} from "@/lib/core/types/payload-types";

import { buildProductPurchaseSectionData } from "@/lib/core/adapter";
import { Review } from "@/lib/core/types/payload-types";
import {
  CollectionName,
  CombinedVariantData,
  type ProductSinglePage,
} from "@/lib/core/types/types";

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
  static async queryCurrentUser(req: Request): Promise<User | null> {
    try {
      const payload = await this.getPayload();

      const user = await payload.auth({
        req: req as unknown as PayloadRequest,
        headers: req.headers,
      });

      return (user?.user as User) ?? null;
    } catch {
      return null;
    }
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

  static async queryCombinedVariantData(
    productId: number,
  ): Promise<CombinedVariantData> {
    const payload = await Queries.getPayload();
    const { isEnabled: draft } = await draftMode();

    const variantsRes = await payload.find({
      collection: "variants",
      depth: 0,
      limit: 20,
      pagination: false,
      where: {
        and: [
          { product: { equals: productId } },
          ...(draft ? [] : [{ _status: { equals: "published" } }]),
        ],
      },
      select: {
        id: true,
        inventory: true,
        priceInUSD: true,
        options: true,
      },
    });

    if (!variantsRes.docs.length) return null;

    const optionIds = [
      ...new Set(variantsRes.docs.flatMap((v) => v.options).map(String)),
    ];

    const optionsRes = await payload.find({
      collection: "variantOptions",
      depth: 0,
      limit: 20,
      pagination: false,
      where: { id: { in: optionIds } },
      select: {
        id: true,
        label: true,
        variantType: true,
      },
    });

    if (!optionsRes.docs.length) return null;

    const typeIds = [
      ...new Set(optionsRes.docs.map((o) => String(o.variantType))),
    ];

    const variantTypesRes = await payload.find({
      collection: "variantTypes",
      depth: 0,
      limit: 20,
      pagination: false,
      where: { id: { in: typeIds } },
      select: {
        id: true,
        label: true,
      },
    });

    if (!variantTypesRes.docs.length) return null;

    return {
      variants: variantsRes.docs,
      variantTypes: variantTypesRes.docs,
      options: optionsRes.docs,
    } as CombinedVariantData;
  }

  static queryProductBySlug(slug: string): Promise<ProductSinglePage | null> {
    return Queries.cache<ProductSinglePage | null>(
      async () => {
        const product = await this.queryBySlug<Product>(
          CollectionName.products,
          slug,
          1,
          {
            title: true,
            description: true,
            updatedAt: true,
            gallery: true,
            priceInUSD: true,
            inventory: true,
            faqs: true,
            reviews: true,
            enableVariants: true,
          },
        );

        if (!product) return null;

        const payload = await Queries.getPayload();

        let relatedProducts =
          (
            await payload.findByID({
              collection: CollectionName.products,
              id: product.id,
              depth: 0,
              select: { relatedProducts: true },
            })
          ).relatedProducts ?? [];

        if (relatedProducts.length) {
          const allProducts = await Queries.queryAllProducts();
          relatedProducts = allProducts.filter((p) =>
            relatedProducts.includes(p.id),
          );
        }

        const combined = product.enableVariants
          ? await this.queryCombinedVariantData(product.id)
          : null;

        return {
          id: product.id,
          title: product.title,
          description: product.description,
          updatedAt: product.updatedAt,
          gallery: product.gallery,
          faqs: product.faqs,
          relatedProducts: relatedProducts as Product[],
          reviews: product.reviews?.docs as Review[],

          purchase_section: buildProductPurchaseSectionData(product, combined),
        };
      },
      [`${CollectionName.products}-${slug}`],
      [`${CollectionName.products}-${slug}`],
    )();
  }

  static queryCategoryBySlug(slug: string): Promise<Category | null> {
    return Queries.cache<Category | null>(
      () =>
        this.queryBySlug<Category>(CollectionName.category, slug, 1, {
          title: true,
          image: true,
          slug: true,
          description: true,
          updatedAt: true,
          faqs: true,
        }),
      [`${CollectionName.category}-${slug}`],
      [`${CollectionName.category}-${slug}`],
    )();
  }

  static queryAllProducts(): Promise<Product[]> {
    return Queries.cache(
      async () => {
        const payload = await Queries.getPayload();

        const res = await payload.find({
          collection: CollectionName.products,
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
      [`bootstrap-${CollectionName.products}`],
      ["bootstrap"],
    )();
  }

  private static async fetchSlugs(
    collection: CollectionName,
  ): Promise<SitemapItem[]> {
    const payload = await Queries.getPayload();

    const res = await payload.find({
      collection,
      draft: false,
      overrideAccess: false,
      limit: 0,
      pagination: false,
      sort: "-updatedAt",
      depth: 0,
      where: { _status: { equals: "published" } },
      select: { slug: true, updatedAt: true },
    });

    return res.docs as SitemapItem[];
  }

  static querySitemapData(): Promise<SitemapData> {
    return Queries.cache(
      async (): Promise<SitemapData> => {
        const [products, categories] = await Promise.all([
          Queries.fetchSlugs(CollectionName.products),
          Queries.fetchSlugs(CollectionName.category),
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
          collection: CollectionName.category,
          depth: 0,
          limit: 0,
          pagination: false,
          sort: "position",
          where: { _status: { equals: "published" } },
          select: {
            id: true,
            title: true,
            slug: true,
          },
        });

        return res.docs;
      },
      [`bootstrap-${CollectionName.category}`],
      ["bootstrap"],
    )();
  }
}
