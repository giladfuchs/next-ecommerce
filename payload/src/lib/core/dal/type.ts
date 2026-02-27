import type {
  Category,
  Product,
  SiteSetting,
  User,
} from "@/lib/core/types/payload-types";
import type { ProductSinglePage } from "@/lib/core/types/types";

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
