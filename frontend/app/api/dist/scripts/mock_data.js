"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBToJson = DBToJson;
exports.importMockData = importMockData;
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
const promises_1 = __importDefault(require("fs/promises"));
dotenv_1.default.config();
const db_1 = require("../src/lib/db");
const entities_1 = require("../src/lib/entities");
async function DBToJson() {
    await db_1.DB.initialize();
    // Fetch products and categories
    const [products, categories, orders] = await Promise.all([
        db_1.DB.getRepository(entities_1.Product).find({
            relations: ["images"],
            order: {
                updatedAt: "DESC",
                images: { position: "ASC" },
            },
        }),
        db_1.DB.getRepository(entities_1.Category).find({
            order: { position: "ASC" },
        }),
        db_1.DB.getRepository(entities_1.Order).find({
            relations: ["items"],
        }),
    ]);
    const categories_map_id_handle = Object.fromEntries(categories.map((c) => [c.id, c.handle]));
    const formatted_products = products.map((product) => ({
        ...product,
        category: categories_map_id_handle[product.category_id],
        featuredImage: product.images[0],
    }));
    const data = {
        products: formatted_products,
        categories,
        orders,
    };
    // Write to file
    await promises_1.default.writeFile("scripts/mock-data.json", JSON.stringify(data, null, 2), "utf-8");
    console.log("✅ Mock data exported to mock-data.json");
    process.exit(0);
}
async function importMockData() {
    await db_1.DB.initialize();
    // await DB.getRepository(Category).save(mockData.categories);
    // await DB.getRepository(Product).save(mockData.products);
    // await DB.getRepository(Order).save(mockData.orders);
    console.log("✅ Imported mock data into database");
}
// DBToJson().catch((err) => {
//     console.error("❌ Failed to export mock data", err);
//     process.exit(1);
// });
// jsonToDB().catch((err) => {
//     console.error("❌ Failed to import mock data", err);
//     process.exit(1);
// });
//# sourceMappingURL=mock_data.js.map