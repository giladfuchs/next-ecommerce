import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";

import type {
  Category,
  Media,
  Product,
  Review,
  SiteSetting,
  User,
  Variant,
  VariantOption,
  VariantType,
} from "@/lib/core/types/payload-types";

import { buildProductPurchaseSectionData } from "@/lib/core/adapter";
import appConfig from "@/lib/core/config";
import {
  type SitemapData,
  type SitemapItem,
  AppConst,
  CollectionName,
  type CombinedVariantData,
  type ProductSinglePage,
} from "@/lib/core/types/types";
import { getRevalidateTag } from "@/lib/core/util";

type FetchApiOptions = {
  tag?: string;
  params?: Record<string, string | number | boolean | null | undefined>;
  select?: Record<string, true>;
  expect?: "docs" | "first" | "json";
  req?: Request;
};

export default class Api {
  private static cache<T>(fn: () => Promise<T>, key: string, tag: string) {
    return unstable_cache(fn, [key], {
      revalidate: false,
      tags: [getRevalidateTag(tag)],
    });
  }

  private static buildApiUrl(
    path: string,
    params?: Record<string, string | number | boolean | null | undefined>,
    select?: Record<string, true>,
  ) {
    const qs = new URLSearchParams();

    qs.set("pagination", "false");

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        qs.set(key, String(value));
      }
    }

    if (select) {
      for (const key of Object.keys(select)) {
        qs.set(`select[${key}]`, "true");
      }
    }

    if (!qs.has("limit")) {
      qs.set("limit", "100");
    }

    return `${appConfig.SERVER_URL}/api/${path}${qs.toString() ? `?${qs.toString()}` : ""}`;
  }

  private static async parseApiResponse<T>(
    res: Response,
    url: string,
    expect?: "docs" | "first" | "json",
  ): Promise<T> {
    if (!res.ok) {
      throw new Error(`fetchApi failed: ${res.status} ${url}`);
    }

    const json = await res.json();

    if (expect === "json") {
      return json as T;
    }

    if (expect === "first") {
      return (json.docs?.[0] ?? null) as T;
    }

    return (json.docs ?? []) as T;
  }

  private static async fetchApi<T>(
    path: string,
    { tag, params, select, expect, req }: FetchApiOptions = {},
  ): Promise<T> {
    const url = Api.buildApiUrl(path, params, select);
    const cookie = req?.headers.get("cookie") ?? "";

    if (!tag) {
      const res = await fetch(url, {
        cache: "no-store",
        headers: cookie ? { cookie } : undefined,
      });

      return Api.parseApiResponse<T>(res, url, expect);
    }

    const key = `${path}-${expect ?? "docs"}-${JSON.stringify(params ?? {})}-${JSON.stringify(select ?? {})}`;

    const res = await fetch(url, {
      cache: "force-cache",
      next: {
        tags: [getRevalidateTag(tag)],
      },
    });

    return Api.parseApiResponse<T>(res, key, expect);
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
      ...(draft ? {} : { tag: `${collection}-${slug}` }),
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
        label: true,
        variantType: true,
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
            },
            expect: "docs",
            tag: AppConst.CACHE_TAG_BOOTSTRAP,
          },
        );

        const imageIds = Array.from(
          new Set(
            products.map((product) => Number(product.image)).filter(Boolean),
          ),
        );

        if (!imageIds.length) {
          return products;
        }

        const media = await Api.fetchApi<Media[]>("media", {
          params: {
            depth: 0,
            "where[id][in]": imageIds.join(","),
          },
          expect: "docs",
          tag: AppConst.CACHE_TAG_BOOTSTRAP,
        });

        const mediaById = new Map<number, Media>();

        for (const mediaItem of media) {
          mediaById.set(Number(mediaItem.id), mediaItem);
        }

        return products.map((product) => ({
          ...product,
          image: mediaById.get(Number(product.image)) as Media,
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
        inventory: true,
        faqs: true,
        reviews: true,
        enableVariants: true,
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
    const [products, categories] = await Promise.all([
      Api.fetchSlugs(CollectionName.products),
      Api.fetchSlugs(CollectionName.category),
    ]);

    return { products, categories };
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

  static queryCategoriesBasic(): Promise<Category[]> {
    return Api.cache(
      () =>
        Api.fetchApi<Category[]>(`${CollectionName.category}`, {
          params: {
            depth: 0,
            sort: "position",
            "where[_status][equals]": "published",
          },
          select: {
            id: true,
            title: true,
            slug: true,
          },
          expect: "docs",
          tag: AppConst.CACHE_TAG_BOOTSTRAP,
        }),
      "categories-basic",
      AppConst.CACHE_TAG_BOOTSTRAP,
    )();
  }
}
