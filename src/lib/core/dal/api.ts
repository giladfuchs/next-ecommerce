import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";

import type {
  Category,
  Media,
  Page,
  Product,
  Review,
  SiteSetting,
  User,
  Variant,
  VariantOption,
  VariantType,
} from "@/lib/core/types/payload-types";

import { buildProductPurchaseSectionData } from "@/lib/core/adapter";
import BaseApi from "@/lib/core/dal/base-api";
import { createMediaResolver } from "@/lib/core/media";
import {
  type ArchiveEntriesOptions,
  type ArchiveProductsOptions,
  type SitemapData,
  type SitemapItem,
  AppConst,
  CollectionName,
  type CombinedVariantData,
  type ProductSinglePage,
} from "@/lib/core/types/types";
import { getRevalidateTag } from "@/lib/core/util";

export default class Api extends BaseApi {
  private static cache<T>(fn: () => Promise<T>, key: string, tag: string) {
    return unstable_cache(fn, [key], {
      revalidate: false,
      tags: [getRevalidateTag(tag)],
    });
  }

  static async queryCurrentUser(req: Request): Promise<User | null> {
    try {
      return await Api.fetchApi<User | null>("users/me", {
        expect: "json",
        req,
      });
    } catch {
      return null;
    }
  }

  private static async queryBySlug<T>(
    collection: CollectionName,
    slug: string,
    depth: number,
    select?: Record<string, true>,
    additionalTags?: string[],
  ): Promise<T | null> {
    const { isEnabled: draft } = await draftMode();

    const params: Record<string, string | number | boolean> = {
      depth,
      limit: 1,
      draft: draft ? "true" : "false",
      "where[and][0][slug][equals]": slug,
    };

    if (!draft) {
      params["where[and][1][_status][equals]"] = "published";
    }

    return Api.fetchApi<T | null>(`${collection}`, {
      params,
      select,
      expect: "first",
      ...(draft ? {} : { tag: `${collection}-${slug}`, tags: additionalTags }),
    });
  }

  private static async queryCombinedVariantData(
    productId: number,
    tag: string,
  ): Promise<CombinedVariantData> {
    const { isEnabled: draft } = await draftMode();

    const variants = await Api.fetchApi<Variant[]>("variants", {
      params: {
        depth: 0,
        limit: 100,
        draft: draft ? "true" : undefined,
        "where[and][0][product][equals]": productId,
        ...(draft ? {} : { "where[and][1][_status][equals]": "published" }),
      },
      select: {
        inventory: true,
        priceInUSD: true,
        priceInUSDEnabled: true,
        originalPriceInUSD: true,
        options: true,
      },
      expect: "docs",
      ...(draft ? {} : { tag }),
    });

    if (!variants.length) {
      return null;
    }

    const optionIds = [
      ...new Set(
        variants.flatMap((variant) => variant.options ?? []).map(String),
      ),
    ];

    const options = await Api.fetchApi<VariantOption[]>("variantOptions", {
      params: {
        depth: 0,
        limit: 200,
        "where[id][in]": optionIds.join(","),
      },
      select: {
        _variantOptions_options_order: true,
        label: true,
        swatch: true,
        variantType: true,
        value: true,
      },
      expect: "docs",
      ...(draft ? {} : { tag }),
    });

    if (!options.length) {
      return null;
    }

    const typeIds = [
      ...new Set(options.map((option) => String(option.variantType))),
    ];

    const variantTypes = await Api.fetchApi<VariantType[]>("variantTypes", {
      params: {
        depth: 0,
        limit: 200,
        "where[id][in]": typeIds.join(","),
      },
      select: {
        label: true,
        selectorStyle: true,
      },
      expect: "docs",
      ...(draft ? {} : { tag }),
    });

    if (!variantTypes.length) {
      return null;
    }

    return {
      variants,
      options,
      variantTypes,
    } as CombinedVariantData;
  }

  static queryAllProducts(): Promise<Product[]> {
    return Api.cache(
      async () => {
        const products = await Api.fetchApi<Product[]>(
          `${CollectionName.products}`,
          {
            params: {
              depth: 0,
              sort: "-updatedAt",
              "where[_status][equals]": "published",
            },
            select: {
              title: true,
              slug: true,
              image: true,
              categories: true,
              priceInUSD: true,
              originalPriceInUSD: true,
            },
            expect: "docs",
            tag: AppConst.CACHE_TAG_BOOTSTRAP,
          },
        );

        const resolveMedia = await createMediaResolver(
          products.map((product) => product.image),
          (ids) =>
            Api.fetchApi<Media[]>("media", {
              params: {
                depth: 0,
                "where[id][in]": ids.join(","),
              },
              expect: "docs",
              tag: AppConst.CACHE_TAG_BOOTSTRAP,
            }),
        );

        return products.map((product) => ({
          ...product,
          image: resolveMedia(product.image),
        })) as Product[];
      },
      "all-products",
      AppConst.CACHE_TAG_BOOTSTRAP,
    )();
  }

  static async queryProductBySlug(
    slug: string,
  ): Promise<ProductSinglePage | null> {
    const product = await Api.queryBySlug<Product>(
      CollectionName.products,
      slug,
      1,
      {
        title: true,
        description: true,
        updatedAt: true,
        gallery: true,
        priceInUSD: true,
        originalPriceInUSD: true,
        inventory: true,
        faqs: true,
        reviews: true,
        enableVariants: true,
        variantTypes: true,
      },
    );

    if (!product) {
      return null;
    }

    const tag = `${CollectionName.products}-${slug}`;

    const relatedProductDoc = await Api.queryBySlug<Product>(
      CollectionName.products,
      slug,
      0,
      {
        relatedProducts: true,
      },
    );

    const relatedIds = (relatedProductDoc?.relatedProducts ?? []) as number[];

    let relatedProducts: Product[] = [];

    if (relatedIds.length) {
      const allProducts = await Api.queryAllProducts();
      relatedProducts = allProducts.filter((relatedProduct) =>
        relatedIds.includes(relatedProduct.id),
      );
    }

    const combined = product.enableVariants
      ? await Api.queryCombinedVariantData(product.id, tag)
      : null;
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      updatedAt: product.updatedAt,
      gallery: product.gallery,
      faqs: product.faqs,
      relatedProducts,
      reviews: product.reviews?.docs as Review[],
      purchase_section: buildProductPurchaseSectionData(product, combined),
    };
  }

  static queryCategoryBySlug(slug: string): Promise<Category | null> {
    return Api.queryBySlug<Category>(CollectionName.category, slug, 1, {
      title: true,
      image: true,
      slug: true,
      description: true,
      updatedAt: true,
      faqs: true,
    });
  }

  static async queryPageBySlug(slug: string): Promise<Page | null> {
    const tag = `${CollectionName.pages}-${slug}`;
    const page = await Api.queryBySlug<Page>(
      CollectionName.pages,
      slug,
      0,
      {
        title: true,
        slug: true,
        hero: true,
        layout: true,
        meta: true,
        updatedAt: true,
      },
      [AppConst.CACHE_TAG_BOOTSTRAP],
    );

    if (!page) return null;

    const { isEnabled: draft } = await draftMode();
    const resolveMedia = await createMediaResolver(
      [page.meta.image, page.hero.media],
      (ids) =>
        Api.fetchApi<Media[]>("media", {
          params: {
            depth: 0,
            "where[id][in]": ids.join(","),
          },
          expect: "docs",
          ...(draft ? {} : { tag, tags: [AppConst.CACHE_TAG_BOOTSTRAP] }),
        }),
    );

    return {
      ...page,
      hero: {
        ...page.hero,
        media: resolveMedia(page.hero.media),
      },
      meta: {
        ...page.meta,
        image: resolveMedia(page.meta.image),
      },
    } as Page;
  }

  static async queryArchiveProducts({
    categoryIds,
    productIds,
    limit = 10,
  }: ArchiveProductsOptions): Promise<Product[]> {
    const products = await Api.queryAllProducts();

    if (productIds) {
      const productById = new Map(
        products.map((product) => [String(product.id), product]),
      );

      return productIds
        .slice(0, Math.max(0, limit))
        .map((id) => productById.get(String(id)))
        .filter((product): product is Product => Boolean(product));
    }

    const categorySet = new Set(categoryIds?.map(String) ?? []);
    const filtered = categorySet.size
      ? products.filter((product) =>
          product.categories?.some((category) =>
            categorySet.has(
              String(typeof category === "object" ? category.id : category),
            ),
          ),
        )
      : products;

    return filtered.slice(0, Math.max(0, Math.min(limit, 24)));
  }

  static async queryArchivePages({
    ids,
    excludeId,
    limit = 10,
  }: ArchiveEntriesOptions): Promise<Page[]> {
    const pages = await Api.fetchApi<Page[]>(`${CollectionName.pages}`, {
      params: {
        depth: 1,
        limit: 1000,
        sort: "-updatedAt",
        "where[_status][equals]": "published",
      },
      select: {
        title: true,
        slug: true,
        meta: true,
      },
      expect: "docs",
      tag: AppConst.CACHE_TAG_BOOTSTRAP,
    });
    const available = pages.filter(
      (page) =>
        excludeId === undefined || String(page.id) !== String(excludeId),
    );

    if (ids) {
      const pageById = new Map(
        available.map((page) => [String(page.id), page]),
      );
      return ids
        .slice(0, Math.max(0, limit))
        .map((id) => pageById.get(String(id)))
        .filter((page): page is Page => Boolean(page));
    }

    return available.slice(0, Math.max(0, Math.min(limit, 24)));
  }

  static async queryArchiveCategories({
    ids,
    limit = 10,
  }: ArchiveEntriesOptions): Promise<Category[]> {
    const categories = await Api.fetchApi<Category[]>(
      `${CollectionName.category}`,
      {
        params: {
          depth: 1,
          limit: 1000,
          sort: "position",
          "where[_status][equals]": "published",
        },
        select: {
          title: true,
          slug: true,
          image: true,
          description: true,
        },
        expect: "docs",
        tag: AppConst.CACHE_TAG_BOOTSTRAP,
      },
    );

    if (ids) {
      const categoryById = new Map(
        categories.map((category) => [String(category.id), category]),
      );
      return ids
        .slice(0, Math.max(0, limit))
        .map((id) => categoryById.get(String(id)))
        .filter((category): category is Category => Boolean(category));
    }

    return categories.slice(0, Math.max(0, Math.min(limit, 24)));
  }

  private static async fetchSlugs(
    collection: CollectionName,
  ): Promise<SitemapItem[]> {
    return Api.fetchApi<SitemapItem[]>(`${collection}`, {
      params: {
        depth: 0,
        sort: "-updatedAt",
        "where[_status][equals]": "published",
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      expect: "docs",
      tag: AppConst.CACHE_TAG_SITEMAP,
    });
  }

  static async querySitemapData(): Promise<SitemapData> {
    const [products, categories, pages] = await Promise.all([
      Api.fetchSlugs(CollectionName.products),
      Api.fetchSlugs(CollectionName.category),
      Api.fetchSlugs(CollectionName.pages),
    ]);

    return { products, categories, pages };
  }

  static querySiteSettings(): Promise<SiteSetting> {
    return Api.cache(
      () =>
        Api.fetchApi<SiteSetting>("globals/site-settings", {
          params: {
            depth: 2,
          },
          expect: "json",
          tag: "site-settings",
        }),
      "site-settings",
      "site-settings",
    )();
  }
}
