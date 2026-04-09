import type {
  Cart,
  Order,
  Product,
  Review,
  Category,
  SiteSetting,
  User,
} from "@/lib/core/types/payload-types";

export enum RoutePath {
  product = "product",
  category = "category",
}

export enum CollectionName {
  products = "products",
  category = "category",
}
export const AppConst = {
  CACHE_TAG_BOOTSTRAP: "bootstrap",
  CACHE_TAG_SITEMAP: "sitemap",
} as const;

export type PropsSlug = { params: Promise<{ slug: string }> };

export type SitemapItem = { slug: string; updatedAt: string };

export type SitemapData = {
  products: SitemapItem[];
  categories: SitemapItem[];
};

export type DalStatic = {
  queryAllProducts(): Promise<Product[]>;
  queryCategoryBySlug(slug: string): Promise<Category | null>;
  queryProductBySlug(slug: string): Promise<ProductSinglePage | null>;

  queryCategoriesBasic(): Promise<Category[]>;
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
  variants: Array<{
    typeId: number | string;
    typeLabel: string;
    options: Array<{
      id: string;
      label: string;
      inventory: number;
      price: number;
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
    priceInUSD: number;
  }[];
  variantTypes: {
    id: number;
    label: string;
  }[];
  options: {
    id: number;
    variantType: number;
    label: string;
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
