export const getPublicData = async () => {
  const { DB } = await import("backend/dist/src/lib/db.js");
  const { Product, Category } = await import("backend/dist/src/lib/entities.js");

  if (!DB.isInitialized) {
    await DB.initialize();
  }

  const [products, categories] = await Promise.all([
    DB.getRepository(Product).find({
      relations: ["images"],
      order: {
        updatedAt: "DESC",
        images: { position: "ASC" },
      },
    }),
    DB.getRepository(Category).find({
      order: { position: "ASC" },
    }),
  ]);

  const categories_map_id_handle = Object.fromEntries(
    categories.map((c: any) => [c.id, c.handle])
  ) as Record<number, string>;

  const formatted_products = products.map((product: any) => ({
    ...product,
    category: categories_map_id_handle[product.category_id],
    featuredImage: product.images[0],
  }));

  return { products: formatted_products, categories };
};