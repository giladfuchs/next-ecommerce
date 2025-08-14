import { Category, Product } from "@/lib/types/entities";

export type PropsHandle = {
  params: Promise<{ handle: string }>;
};

export type ResponseData = {
  products: Product[];
  categories: Category[];
};
