import { Category, Product } from "../types";
import { fetchData } from "./api";

export async function getProducts(force = false): Promise<Product[]> {
  const { products } = await fetchData(force);
  return products;
}

export async function getCategories(force = false): Promise<Category[]> {
  const { categories } = await fetchData(force);
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
