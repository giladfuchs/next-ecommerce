import { Category, Product } from "../types";
import { getData } from "./api";

export async function getProducts(): Promise<Product[]> {
  const { products } = await getData();
  return products;
}
export async function getProductByHandle(
  handle: string,
): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.handle === handle);
}

export async function getCategories(): Promise<Category[]> {
  const { categories } = await getData();
  return categories;
}

export async function getCategory(
  handle: string,
): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((category) => category.handle === handle);
}

export async function getCategoryProducts({
  category,
}: {
  category: string;
}): Promise<Product[]> {
  const products: Product[] = await getProducts();
  return products.filter((product: Product) => product.category === category);
}
