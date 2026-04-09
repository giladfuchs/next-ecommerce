import configPromise from "@payload-config";
import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";
import { getPayload as initPayload, type PayloadRequest } from "payload";

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
import {
  type SitemapData,
  type SitemapItem,
  AppConst,
  CollectionName,
  type CombinedVariantData,
  type ProductSinglePage,
} from "@/lib/core/types/types";
import { getRevalidateTag } from "@/lib/core/util";

type PayloadInstance = Awaited<ReturnType<typeof initPayload>>;
type PayloadFindArgs = Parameters<PayloadInstance["find"]>[0];
type PayloadFindGlobalArgs = Parameters<PayloadInstance["findGlobal"]>[0];

type PayloadQueryOptions = {
  tag: string;
  cache?: boolean;
};

type PayloadFindOptions = PayloadQueryOptions & {
  collection: PayloadFindArgs["collection"];
  params: Omit<PayloadFindArgs, "collection">;
};

type PayloadGlobalOptions = PayloadQueryOptions & {
  params: PayloadFindGlobalArgs;
};

export default class Queries {
  private static instance: PayloadInstance | null = null;

  private static async getPayload() {
    if (!Queries.instance) {
      Queries.instance = await initPayload({ config: configPromise });
    }

    return Queries.instance;
  }

  private static cache<T>(fn: () => Promise<T>, key: string, tag: string) {
    return unstable_cache(fn, [key], {
      revalidate: false,
      tags: [getRevalidateTag(tag)],
    });
  }

  private static async runPayloadFind<T>({
    collection,
    params,
    tag,
    cache = true,
  }: PayloadFindOptions): Promise<T[]> {
    if (!cache) {
      const payload = await Queries.getPayload();
      const res = await payload.find({
        collection,
        ...params,
      });

      return res.docs as T[];
    }

    return Queries.cache(
      async () => {
        const payload = await Queries.getPayload();
        const res = await payload.find({
          collection,
          ...params,
        });

        return res.docs as T[];
      },
      `${collection}-${tag}-${JSON.stringify(params)}`,
      tag,
    )();
  }

  private static async runPayloadGlobal<T>({
    params,
    tag,
    cache = true,
  }: PayloadGlobalOptions): Promise<T> {
    if (!cache) {
      const payload = await Queries.getPayload();
      return (await payload.findGlobal(params)) as T;
    }

    return Queries.cache(
      async () => {
        const payload = await Queries.getPayload();
        return (await payload.findGlobal(params)) as T;
      },
      `global-${tag}-${JSON.stringify(params)}`,
      tag,
    )();
  }

  static async queryCurrentUser(req: Request): Promise<User | null> {
    try {
      const payload = await Queries.getPayload();

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

    const docs = await Queries.runPayloadFind<T>({
      collection,
      tag: `${collection}-${slug}`,
      cache: !draft,
      params: {
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
      },
    });

    return docs[0] ?? null;
  }

  private static async queryCombinedVariantData(
    productId: number,
    tag: string,
  ): Promise<CombinedVariantData> {
    const { isEnabled: draft } = await draftMode();

    const variants = await Queries.runPayloadFind<Variant>({
      collection: "variants",
      tag,
      cache: !draft,
      params: {
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
          inventory: true,
          priceInUSD: true,
          options: true,
        },
      },
    });

    if (!variants.length) {
      return null;
    }

    const optionIds = [
      ...new Set(variants.flatMap((variant) => variant.options).map(String)),
    ];

    const options = await Queries.runPayloadFind<VariantOption>({
      collection: "variantOptions",
      tag,
      cache: !draft,
      params: {
        depth: 0,
        limit: 20,
        pagination: false,
        where: {
          id: { in: optionIds },
        },
        select: {
          label: true,
          variantType: true,
        },
      },
    });

    if (!options.length) {
      return null;
    }

    const typeIds = [
      ...new Set(options.map((option) => String(option.variantType))),
    ];

    const variantTypes = await Queries.runPayloadFind<VariantType>({
      collection: "variantTypes",
      tag,
      cache: !draft,
      params: {
        depth: 0,
        limit: 20,
        pagination: false,
        where: {
          id: { in: typeIds },
        },
        select: {
          label: true,
        },
      },
    });

    if (!variantTypes.length) {
      return null;
    }

    return {
      variants,
      variantTypes,
      options,
    } as CombinedVariantData;
  }

  static async queryAllProducts(): Promise<Product[]> {
    const products = await Queries.runPayloadFind<Product>({
      collection: CollectionName.products,
      tag: AppConst.CACHE_TAG_BOOTSTRAP,
      params: {
        draft: false,
        overrideAccess: false,
        limit: 0,
        pagination: false,
        sort: "-updatedAt",
        depth: 0,
        where: {
          _status: { equals: "published" },
        },
        select: {
          title: true,
          slug: true,
          image: true,
          categories: true,
          priceInUSD: true,
        },
      },
    });

    const imageIds = Array.from(
      new Set(products.map((product) => Number(product.image)).filter(Boolean)),
    );

    if (!imageIds.length) {
      return products;
    }

    const media = await Queries.runPayloadFind<Media>({
      collection: "media",
      tag: AppConst.CACHE_TAG_BOOTSTRAP,
      params: {
        depth: 0,
        limit: 0,
        pagination: false,
        where: {
          id: { in: imageIds },
        },
      },
    });

    const mediaById = new Map<number, Media>();

    for (const mediaItem of media) {
      mediaById.set(Number(mediaItem.id), mediaItem);
    }

    return products.map((product) => ({
      ...product,
      image: mediaById.get(Number(product.image)) as Media,
    })) as Product[];
  }

  static async queryProductBySlug(
    slug: string,
  ): Promise<ProductSinglePage | null> {
    const product = await Queries.queryBySlug<Product>(
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
    const { isEnabled: draft } = await draftMode();

    const relatedProductIds =
      (
        await Queries.runPayloadFind<{ relatedProducts?: number[] }>({
          collection: CollectionName.products,
          tag,
          cache: !draft,
          params: {
            depth: 0,
            draft,
            overrideAccess: draft,
            limit: 1,
            pagination: false,
            where: {
              id: {
                equals: product.id,
              },
            },
            select: {
              relatedProducts: true,
            },
          },
        })
      )[0]?.relatedProducts ?? [];

    let relatedProducts: Product[] = [];

    if (relatedProductIds.length) {
      const allProducts = await Queries.queryAllProducts();
      relatedProducts = allProducts.filter((relatedProduct) =>
        relatedProductIds.includes(relatedProduct.id),
      );
    }

    const combined = product.enableVariants
      ? await Queries.queryCombinedVariantData(product.id, tag)
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
    return Queries.queryBySlug<Category>(CollectionName.category, slug, 1, {
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
    return Queries.runPayloadFind<SitemapItem>({
      collection,
      tag: AppConst.CACHE_TAG_SITEMAP,
      params: {
        draft: false,
        overrideAccess: false,
        limit: 0,
        pagination: false,
        sort: "-updatedAt",
        depth: 0,
        where: {
          _status: { equals: "published" },
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      },
    });
  }

  static async querySitemapData(): Promise<SitemapData> {
    const [products, categories] = await Promise.all([
      Queries.fetchSlugs(CollectionName.products),
      Queries.fetchSlugs(CollectionName.category),
    ]);

    return {
      products,
      categories,
    };
  }

  static querySiteSettings(): Promise<SiteSetting> {
    return Queries.runPayloadGlobal<SiteSetting>({
      tag: "site-settings",
      params: {
        slug: "site-settings",
        depth: 2,
      },
    });
  }

  static queryCategoriesBasic(): Promise<Category[]> {
    return Queries.runPayloadFind<Category>({
      collection: CollectionName.category,
      tag: AppConst.CACHE_TAG_BOOTSTRAP,
      params: {
        depth: 0,
        limit: 0,
        pagination: false,
        sort: "position",
        where: {
          _status: { equals: "published" },
        },
        select: {
          title: true,
          slug: true,
        },
      },
    });
  }
}
