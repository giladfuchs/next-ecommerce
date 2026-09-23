import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";

import type {
  Category,
  Page,
  Product,
  Review,
  SeoMedia,
  SiteSetting,
  User,
  Variant,
  VariantOption,
  VariantType,
} from "@/lib/core/types/payload-types";

import { buildProductPurchaseSectionData } from "@/lib/core/adapter";
import BaseDal from "@/lib/core/dal/base-dal";
import {
  type CategoryDetail,
  type SitemapData,
  type SitemapItem,
  AppConst,
  CollectionName,
  type CombinedVariantData,
  type ProductSinglePage,
  type ResolvedPage,
} from "@/lib/core/types/types";
import { getRevalidateTag } from "@/lib/core/util";

export default class Api extends BaseDal {
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
              meta: true,
              categories: true,
              priceInUSD: true,
              originalPriceInUSD: true,
            },
            expect: "docs",
            tag: AppConst.CACHE_TAG_BOOTSTRAP,
          },
        );

        return Api.resolveProductMedia(products, (ids) =>
          Api.fetchApi<SeoMedia[]>("seo-media", {
            params: {
              depth: 0,
              "where[id][in]": ids.join(","),
            },
            expect: "docs",
            tag: AppConst.CACHE_TAG_BOOTSTRAP,
          }),
        );
      },
      "all-products",
      AppConst.CACHE_TAG_BOOTSTRAP,
    )();
  }

  static async queryProductBySlug(
    slug: string,
  ): Promise<ProductSinglePage | null> {
    const product = await Api.queryBySlug<Omit<Product, "slug">>(
      CollectionName.products,
      slug,
      1,
      {
        title: true,
        description: true,
        updatedAt: true,
        meta: true,
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
      meta: product.meta,
      gallery: product.gallery,
      faqs: product.faqs,
      relatedProducts,
      reviews: product.reviews?.docs as Review[],
      purchase_section: buildProductPurchaseSectionData(product, combined),
    };
  }

  static async queryCategoryBySlug(
    slug: string,
  ): Promise<CategoryDetail | null> {
    const category = await Api.queryBySlug<CategoryDetail>(
      CollectionName.category,
      slug,
      1,
      {
        title: true,
        description: true,
        meta: true,
        updatedAt: true,
        faqs: true,
      },
    );

    return category;
  }

  static async queryPageBySlug(slug: string): Promise<ResolvedPage | null> {
    const page = await Api.queryBySlug<Omit<Page, "slug">>(
      CollectionName.pages,
      slug,
      1,
      {
        title: true,
        hero: true,
        layout: true,
        meta: true,
        updatedAt: true,
      },
      [AppConst.CACHE_TAG_BOOTSTRAP],
    );

    return page ? Api.resolvePageLayout(page) : null;
  }

  static fetchArchivePages(): Promise<Page[]> {
    return Api.fetchApi<Page[]>(`${CollectionName.pages}`, {
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
  }

  static fetchArchiveCategories(): Promise<Category[]> {
    return Api.fetchApi<Category[]>(`${CollectionName.category}`, {
      params: {
        depth: 1,
        limit: 1000,
        sort: "title",
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
