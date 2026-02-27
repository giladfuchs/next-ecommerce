import { draftMode } from "next/headers";

import type { SitemapData, SitemapItem } from "@/lib/core/dal/type";
import type {
  Category,
  Media,
  Product,
  SiteSetting,
  VariantOption,
  VariantType,
  Variant,
  User,
} from "@/lib/core/types/payload-types";

import { buildProductPurchaseSectionData } from "@/lib/core/adapter";
import appConfig from "@/lib/core/config";
import {
  CollectionName,
  CombinedVariantData,
  type ProductSinglePage,
} from "@/lib/core/types/types";

export default class Api {
  static async fetchApi<T>(
    path: string,
    {
      keys,
      tags,
      params,
      select,
      expect,
      req,
    }: {
      keys?: string[];
      tags?: string[];
      params?: Record<string, string | number | boolean | null | undefined>;
      select?: Record<string, true>;
      expect?: "docs" | "first" | "json";
      req?: Request;
    } = {},
  ): Promise<T> {
    const qs = new URLSearchParams();

    qs.set("pagination", "false");

    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null) continue;
        qs.set(k, String(v));
      }
    }

    if (select) {
      for (const key of Object.keys(select)) {
        qs.set(`select[${key}]`, "true");
      }
    }

    if (!qs.has("limit")) qs.set("limit", "100");

    const url =
      `${appConfig.BASE_URL}${path}` +
      (qs.toString() ? `?${qs.toString()}` : "");

    const shouldCache = Boolean(keys?.length);
    const cookie = req?.headers.get("cookie") ?? "";

    const res = await fetch(url, {
      cache: shouldCache ? "force-cache" : "no-store",
      next: shouldCache && tags?.length ? { tags } : undefined,
      headers: cookie ? { cookie } : undefined,
    });

    if (!res.ok) throw new Error(`fetchApi failed: ${res.status} ${url}`);

    const json = await res.json();

    if (expect === "json") return json as T;
    if (expect === "first") return (json.docs?.[0] ?? null) as T;
    return (json.docs ?? []) as T;
  }

  static async queryCurrentUser(req: Request): Promise<User | null> {
    try {
      return await this.fetchApi<User | null>(`/api/users/me`, {
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

    if (!draft) params["where[and][1][_status][equals]"] = "published";

    return this.fetchApi<T | null>(`/api/${collection}`, {
      params,
      select,
      expect: "first",
      ...(draft
        ? {}
        : {
            keys: [`${collection}-${slug}-${depth}`],
            tags: [`${collection}-${slug}`],
          }),
    });
  }

  static async queryCombinedVariantData(
    productId: number,
    productSlug: string,
  ): Promise<CombinedVariantData> {
    const { isEnabled: draft } = await draftMode();

    const tag = `${CollectionName.products}-${productSlug}`;

    const variants = await this.fetchApi<Variant[]>(`/api/variants`, {
      params: {
        depth: 0,
        limit: 100,
        ...(draft
          ? { draft: "true" }
          : { "where[_status][equals]": "published" }),
        "where[product][equals]": productId,
      },
      select: {
        id: true,
        inventory: true,
        priceInUSD: true,
        options: true,
      },
      expect: "docs",
      ...(draft ? {} : { keys: [`variants-${productSlug}-0`], tags: [tag] }),
    });

    if (!variants.length) return null;

    const optionIds = Array.from(
      new Set(variants.flatMap((v) => v.options ?? []).map((x) => String(x))),
    );

    const options = await this.fetchApi<VariantOption[]>(
      `/api/variantOptions`,
      {
        params: {
          depth: 0,
          limit: 200,
          "where[id][in]": optionIds.join(","),
        },
        select: {
          id: true,
          label: true,
          variantType: true,
        },
        expect: "docs",
        keys: [`variantOptions-${productSlug}-0`],
        tags: [tag],
      },
    );

    if (!options.length) return null;

    const typeIds = Array.from(
      new Set(options.map((o) => String(o.variantType))),
    );

    const variantTypes = await this.fetchApi<VariantType[]>(
      `/api/variantTypes`,
      {
        params: {
          depth: 0,
          limit: 200,
          "where[id][in]": typeIds.join(","),
        },
        select: {
          id: true,
          label: true,
        },
        expect: "docs",
        keys: [`variantTypes-${productSlug}-0`],
        tags: [tag],
      },
    );
    if (!variantTypes.length) return null;

    return { variants, options, variantTypes } as CombinedVariantData;
  }
  static async queryProductBySlug(
    slug: string,
  ): Promise<ProductSinglePage | null> {
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
        enableVariants: true,
      },
    );

    if (!product) return null;

    const relatedProducts = await (async () => {
      const p = (await this.queryBySlug<Product>(
        CollectionName.products,
        slug,
        0,
        { relatedProducts: true },
      )) as Product;
      const relatedIds = (p.relatedProducts ?? []) as number[];
      return relatedIds.length
        ? (await this.queryAllProducts()).filter((p) =>
            relatedIds.includes(p.id),
          )
        : [];
    })();

    const combined = product.enableVariants
      ? await this.queryCombinedVariantData(product.id, slug)
      : null;

    return {
      title: product.title,
      description: product.description,
      updatedAt: product.updatedAt,
      gallery: product.gallery,
      faqs: product.faqs,
      relatedProducts,
      purchase_section: buildProductPurchaseSectionData(product, combined),
    };
  }

  static async queryCategoryBySlug(slug: string): Promise<Category | null> {
    return this.queryBySlug<Category>(CollectionName.category, slug, 1, {
      title: true,
      image: true,
      slug: true,
      description: true,
      updatedAt: true,
      faqs: true,
    });
  }
  static async queryAllProducts(): Promise<Product[]> {
    const products = await this.fetchApi<Product[]>(
      `/api/${CollectionName.products}`,
      {
        params: {
          depth: 0,
          sort: "-updatedAt",
          "where[_status][equals]": "published",
        },
        select: {
          title: true,
          slug: true,
          gallery: true,
          categories: true,
          priceInUSD: true,
        },
        expect: "docs",
        keys: [`bootstrap-${CollectionName.products}`],
        tags: ["bootstrap"],
      },
    );

    const firstImageIds = Array.from(
      new Set(products.map((p) => p.gallery![0].image as number)),
    );

    const media = firstImageIds.length
      ? await this.fetchApi<Media[]>(`/api/media`, {
          params: {
            depth: 0,
            "where[id][in]": firstImageIds.join(","),
          },
          expect: "docs",
          keys: ["bootstrap-media"],
          tags: ["bootstrap"],
        })
      : [];

    const mediaById = new Map<number, Media>();
    for (const m of media) mediaById.set(Number(m.id), m);

    return products.map((p) => ({
      ...p,
      gallery: [
        { image: mediaById.get(p.gallery![0].image as number) as Media },
      ] as Product["gallery"],
    })) as Product[];
  }

  private static async fetchSlugs(
    collection: CollectionName,
  ): Promise<SitemapItem[]> {
    return await this.fetchApi<SitemapItem[]>(`/api/${collection}`, {
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
      keys: [`bootstrap-slugs-${collection}`],
      tags: ["bootstrap"],
    });
  }

  static async querySitemapData(): Promise<SitemapData> {
    const [products, categories] = await Promise.all([
      Api.fetchSlugs(CollectionName.products),
      Api.fetchSlugs(CollectionName.category),
    ]);

    return { products, categories };
  }

  static async querySiteSettings(): Promise<SiteSetting> {
    return this.fetchApi<SiteSetting>(`/api/globals/site-settings`, {
      params: { depth: 2 },
      expect: "json",
      keys: ["bootstrap-settings"],
      tags: ["bootstrap"],
    });
  }

  static async queryCategoriesBasic(): Promise<Category[]> {
    return this.fetchApi<Category[]>(`/api/${CollectionName.category}`, {
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
      keys: [`bootstrap-${CollectionName.category}`],
      tags: ["bootstrap"],
    });
  }
}
