import type {
  Cart,
  Media,
  Order,
  Product,
  Page,
  Review,
  Category,
  SiteSetting,
  User,
} from "@/lib/core/types/payload-types";

export enum RoutePath {
  product = "product",
  category = "category",
  page = "pages",
}

export enum CollectionName {
  products = "products",
  category = "category",
  pages = "pages",
}
export enum OrderStatus {
  NEW = "new",
  READY = "ready",
  DONE = "done",
  CANCELED = "canceled",
  REFUNDED = "refunded",
}

export const AppConst = {
  CACHE_TAG_BOOTSTRAP: "bootstrap",
  CACHE_TAG_SITEMAP: "sitemap",
} as const;

export type PropsSlug = { params: Promise<{ slug: string }> };

export type MetaInput = {
  title: string;
  description: string;
  image: Media;
  path: string;
  modifiedTime?: string;
};

export type SitemapItem = { slug: string; updatedAt: string };

export type SitemapData = {
  products: SitemapItem[];
  categories: SitemapItem[];
  pages: SitemapItem[];
};

export type ArchiveProductsOptions = {
  categoryIds?: Array<number | string>;
  productIds?: Array<number | string>;
  limit?: number;
};

export type ArchiveEntriesOptions = {
  ids?: Array<number | string>;
  excludeId?: number | string;
  limit?: number;
};

export type FaqItem = {
  question: string;
  answer: string;
  id?: string | null;
};

export type DalStatic = {
  queryAllProducts(): Promise<Product[]>;
  queryCategoryBySlug(slug: string): Promise<Category | null>;
  queryProductBySlug(slug: string): Promise<ProductSinglePage | null>;
  queryPageBySlug(slug: string): Promise<Page | null>;
  queryArchiveProducts(options: ArchiveProductsOptions): Promise<Product[]>;
  queryArchivePages(options: ArchiveEntriesOptions): Promise<Page[]>;
  queryArchiveCategories(options: ArchiveEntriesOptions): Promise<Category[]>;

  querySiteSettings(): Promise<SiteSetting>;
  querySitemapData(): Promise<SitemapData>;

  queryCurrentUser(req: Request): Promise<User | null>;
};

export type CartItem = NonNullable<Cart["items"]>[number];
export type OrderItem = NonNullable<Order["items"]>[number];

export type ProductPurchaseSectionData = {
  id: Product["id"];
  inventory: number;
  price: number;
  originalPrice?: number;
  variants: Array<{
    id: string;
    optionIds: string[];
    inventory: number;
    price: number;
    originalPrice?: number;
  }>;
  variantTypes: Array<{
    typeId: number | string;
    typeLabel: string;
    selectorStyle: "swatch" | "buttons" | "select";
    options: Array<{
      id: string;
      label: string;
      value: string;
      swatch?: string;
    }>;
  }>;
  priceRange: {
    min: number;
    max: number;
  };
};

export type CombinedVariantData = {
  variants: {
    id: number;
    options: number[];
    inventory: number;
    priceInUSD?: number | null;
    priceInUSDEnabled?: boolean | null;
    originalPriceInUSD?: number;
  }[];
  variantTypes: {
    id: number;
    label: string;
    selectorStyle: "swatch" | "buttons" | "select";
  }[];
  options: {
    id: number;
    variantType: number;
    label: string;
    value: string;
    swatch?: string | null;
    _variantOptions_options_order?: string | null;
  }[];
} | null;

export type ProductSinglePage = Pick<
  Product,
  "title" | "description" | "updatedAt" | "gallery" | "faqs" | "id"
> & {
  purchase_section: ProductPurchaseSectionData;
  relatedProducts: Product[];
  reviews: Review[];
};
