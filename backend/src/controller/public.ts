import { DB } from "../lib/db";
import { Product, Category } from "../lib/entities";

export async function getPublicData(): Promise<{ categories: Product[] | Category[]; products: any[] }> {
    const [products, categories] = await Promise.all([
        DB.getRepository(Product).find({
            relations: ["images"],
            order: {
                updatedAt: "DESC",
                images: {
                    position: "ASC",
                },
            },
        }),
        DB.getRepository(Category).find({
            order: { position: "ASC" },
        }),
    ]);

    const categories_map_id_handle = Object.fromEntries(
        categories.map((c) => [c.id, c.handle]),
    ) as Record<number, string>;

    const formatted_products = products.map((product: any) => ({
        ...product,
        category: categories_map_id_handle[product.category_id],
        featuredImage: product.images[0],
    }));

    return { products: formatted_products, categories };
}