import type {
  ArchiveEntriesOptions,
  ArchiveModel,
  ArchiveProductsOptions,
  DalStatic,
  ResolvedPage,
  ResolvedPageBlock,
} from "@/lib/core/types/types";
import type {
  ArchiveBlock,
  Category,
  Page,
  Product,
  SeoMedia,
} from "@/payload-types";

import appConfig from "@/lib/core/config";
import { getRevalidateTag, type UploadMedia } from "@/lib/core/util";

type FetchApiOptions = {
  tag?: string;
  tags?: string[];
  params?: Record<string, string | number | boolean | null | undefined>;
  select?: Record<string, true>;
  expect?: "docs" | "first" | "json";
  req?: Request;
};

type MediaRelationship<T extends UploadMedia = UploadMedia> =
  T["id"] | T | null | undefined;

type ArchiveLoader = {
  queryAllProducts(): Promise<Product[]>;
  fetchArchivePages(): Promise<Page[]>;
  fetchArchiveCategories(): Promise<Category[]>;
};

type ArchiveResolver = Pick<
  DalStatic,
  "queryArchiveProducts" | "queryArchivePages" | "queryArchiveCategories"
>;

export default class BaseDal {
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

  static async fetchApi<T>(
    path: string,
    { tag, tags = [], params, select, expect, req }: FetchApiOptions = {},
  ): Promise<T> {
    const url = BaseDal.buildApiUrl(path, params, select);
    const cookie = req?.headers.get("cookie") ?? "";

    if (!tag && !tags.length) {
      const res = await fetch(url, {
        cache: "no-store",
        headers: cookie ? { cookie } : undefined,
      });

      return BaseDal.parseApiResponse<T>(res, url, expect);
    }

    const key = `${path}-${expect ?? "docs"}-${JSON.stringify(params ?? {})}-${JSON.stringify(select ?? {})}`;

    const res = await fetch(url, {
      cache: "force-cache",
      next: {
        tags: [tag, ...tags]
          .filter((value): value is string => Boolean(value))
          .map(getRevalidateTag),
      },
    });

    return BaseDal.parseApiResponse<T>(res, key, expect);
  }

  private static async createMediaResolver<T extends UploadMedia>(
    relationships: MediaRelationship<T>[],
    loadMedia: (ids: T["id"][]) => Promise<T[]>,
  ) {
    const ids = Array.from(
      new Set(
        relationships
          .filter(
            (relationship): relationship is T["id"] =>
              typeof relationship !== "object" && relationship != null,
          )
          .map(Number)
          .filter(Boolean),
      ),
    );
    const media = ids.length ? await loadMedia(ids) : [];
    const mediaById = new Map(
      media.map((mediaItem) => [String(mediaItem.id), mediaItem]),
    );

    return (relationship: MediaRelationship<T>): MediaRelationship<T> => {
      if (relationship == null || typeof relationship === "object") {
        return relationship;
      }

      return mediaById.get(String(relationship)) ?? relationship;
    };
  }

  static async resolveProductMedia(
    products: Product[],
    loadMedia: (ids: SeoMedia["id"][]) => Promise<SeoMedia[]>,
  ): Promise<Product[]> {
    const resolveMedia = await BaseDal.createMediaResolver(
      products.map((product) => product.meta.image),
      loadMedia,
    );

    return products.map((product) => {
      return {
        ...product,
        meta: {
          ...product.meta,
          image: resolveMedia(product.meta.image),
        },
      };
    }) as Product[];
  }

  static async queryArchiveProducts(
    this: ArchiveLoader,
    { categoryIds, productIds, limit = 10 }: ArchiveProductsOptions,
  ): Promise<Product[]> {
    const products = await this.queryAllProducts();

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

  static async queryArchivePages(
    this: ArchiveLoader,
    { ids, excludeId, limit = 10 }: ArchiveEntriesOptions,
  ): Promise<Page[]> {
    const pages = await this.fetchArchivePages();
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

  static async queryArchiveCategories(
    this: ArchiveLoader,
    { ids, limit = 10 }: ArchiveEntriesOptions,
  ): Promise<Category[]> {
    const categories = await this.fetchArchiveCategories();

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

  private static relationIds<T extends { id: number }>(
    values?: Array<number | T> | null,
  ) {
    return values?.map((value) =>
      typeof value === "object" ? value.id : value,
    );
  }

  private static resolveArchiveItems(
    block: ArchiveBlock,
    currentPageId: number,
    dal: ArchiveResolver,
  ): Promise<ArchiveModel[]> {
    const selected = block.populateBy === "selection";

    if (block.contentType === "pages") {
      return dal.queryArchivePages(
        selected
          ? {
              ids: BaseDal.relationIds<Page>(block.selectedPages),
              excludeId: currentPageId,
              limit: block.selectedPages?.length ?? 0,
            }
          : {
              excludeId: currentPageId,
              limit: block.limit ?? 10,
            },
      );
    }

    if (block.contentType === "categories") {
      return dal.queryArchiveCategories(
        selected
          ? {
              ids: BaseDal.relationIds<Category>(block.selectedCategories),
              limit: block.selectedCategories?.length ?? 0,
            }
          : { limit: block.limit ?? 10 },
      );
    }

    return dal.queryArchiveProducts(
      selected
        ? {
            productIds: BaseDal.relationIds<Product>(block.selectedDocs),
            limit: block.selectedDocs?.length ?? 0,
          }
        : {
            categoryIds: BaseDal.relationIds<Category>(block.categories),
            limit: block.limit ?? 10,
          },
    );
  }

  static async resolvePageLayout(
    this: ArchiveResolver,
    page: Omit<Page, "slug">,
  ): Promise<ResolvedPage> {
    const layout: ResolvedPageBlock[] = await Promise.all(
      page.layout.map(async (block) =>
        block.blockType === "archive"
          ? {
              ...block,
              items: await BaseDal.resolveArchiveItems(block, page.id, this),
            }
          : block,
      ),
    );

    return { ...page, layout };
  }
}
