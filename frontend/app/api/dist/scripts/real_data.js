"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const real_data_json_1 = __importDefault(require("./data/real_data.json"));
const uploaded_urls_json_1 = __importDefault(require("./data/uploaded_urls.json"));
const entities_1 = require("../src/lib/entities");
const db_1 = require("../src/lib/db");
const util_1 = require("../src/lib/util");
const random_image = true;
const image_soon = "https://racit0uja2cckwpw.public.blob.vercel-storage.com/products/coming_soon%20%281%29.png";
async function insertData() {
    const em = db_1.DB.manager;
    console.log("📥 Inserting mock data...");
    const categories = [];
    for (const [index, c] of real_data_json_1.default.categories.entries()) {
        const category = em.create(entities_1.Category, {
            title: c.title,
            handle: (0, util_1.title_to_handle)(c.title),
            position: index,
        });
        const saved = await em.save(category);
        categories.push(saved);
    }
    const categories_map_title_id = Object.fromEntries(categories.map((c) => [c.title, c.id]));
    const getRandomImages = (count) => {
        const shuffled = [...uploaded_urls_json_1.default].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };
    const shuffled_products = [...real_data_json_1.default.products].sort(() => 0.5 - Math.random());
    for (const p of shuffled_products) {
        const randomImages = random_image
            ? getRandomImages(Math.floor(Math.random() * 5) + 1)
            : [image_soon];
        const productImages = randomImages.map((url, position) => em.create(entities_1.ProductImage, {
            url,
            altText: p.title,
            position,
        }));
        const product = em.create(entities_1.Product, {
            handle: (0, util_1.title_to_handle)(p.title),
            category_id: categories_map_title_id[p.category],
            available: true,
            title: p.title,
            description: p.description,
            price: p.price,
            images: productImages,
        });
        await em.save(product);
    }
    console.log("✅ Mock data inserted successfully.");
}
db_1.DB.initialize()
    .then(async () => {
    await insertData();
    process.exit();
})
    .catch((err) => {
    console.error("❌ Failed to run seed script", err);
    process.exit(1);
});
//(for test) SEED=true pnpm tsx scripts/insert_data.ts
//pnpm tsx scripts/insert_data.ts
//# sourceMappingURL=real_data.js.map