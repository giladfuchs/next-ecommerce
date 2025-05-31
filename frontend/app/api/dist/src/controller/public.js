"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetPublicData = handleGetPublicData;
const db_1 = require("../lib/db");
const entities_1 = require("../lib/entities");
async function handleGetPublicData() {
    const [products, categories] = await Promise.all([
        db_1.DB.getRepository(entities_1.Product).find({
            relations: ['images'],
            order: {
                updatedAt: 'DESC',
                images: { position: 'ASC' },
            },
        }),
        db_1.DB.getRepository(entities_1.Category).find({
            order: { position: 'ASC' },
        }),
    ]);
    const categories_map_id_handle = Object.fromEntries(categories.map((c) => [c.id, c.handle]));
    const formatted_products = products.map((product) => ({
        ...product,
        category: categories_map_id_handle[product.category_id],
        featuredImage: product.images[0],
    }));
    return { products: formatted_products, categories };
}
//# sourceMappingURL=public.js.map