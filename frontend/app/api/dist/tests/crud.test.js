"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const test_app_1 = __importDefault(require("./test-app"));
const db_1 = require("../src/lib/db");
const entities_1 = require("../src/lib/entities");
const faker_1 = require("@faker-js/faker");
const util_1 = require("../src/lib/util");
const getValidCategoryId = async () => {
    const categories = await db_1.DB.getRepository(entities_1.Category).find();
    if (!categories.length)
        throw new Error("No categories in DB");
    return categories[Math.floor(Math.random() * categories.length)].id;
};
const generateFakeProduct = async () => ({
    title: faker_1.faker.commerce.productName(),
    description: faker_1.faker.commerce.productDescription(),
    price: parseFloat(faker_1.faker.commerce.price()),
    category_id: await getValidCategoryId(),
    available: true,
    images: [
        {
            url: faker_1.faker.image.url(),
            altText: faker_1.faker.commerce.productAdjective(),
        },
    ],
});
(0, vitest_1.describe)("POST /auth/product/:add_or_id", () => {
    let createdProductId;
    (0, vitest_1.it)("should create a new product", async () => {
        const productData = await generateFakeProduct();
        const res = await (0, supertest_1.default)(test_app_1.default).post("/auth/product/add").send(productData);
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body).toHaveProperty("id");
        (0, vitest_1.expect)(res.body).toHaveProperty("images");
        (0, vitest_1.expect)(Array.isArray(res.body.images)).toBe(true);
        createdProductId = res.body.id;
    });
    (0, vitest_1.it)("should update an existing product", async () => {
        const updatedData = await generateFakeProduct();
        updatedData.title = "[EDITED] " + updatedData.title;
        const res = await (0, supertest_1.default)(test_app_1.default)
            .post(`/auth/product/${createdProductId}`)
            .send(updatedData);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.title).toContain("[EDITED]");
        (0, vitest_1.expect)(res.body.id).toBe(createdProductId);
    });
    (0, vitest_1.it)("should return 400 if images are missing", async () => {
        const productData = await generateFakeProduct();
        delete productData.images;
        const res = await (0, supertest_1.default)(test_app_1.default).post("/auth/product/add").send(productData);
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.error).toMatch(/Missing required field: images/i);
    });
    (0, vitest_1.it)("should return 400 if title missing", async () => {
        const productData = await generateFakeProduct();
        delete productData.title;
        const res = await (0, supertest_1.default)(test_app_1.default).post("/auth/product/add").send(productData);
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.error).toMatch(/handle|title/i);
    });
});
(0, vitest_1.describe)("POST /auth/category/:add_or_id", () => {
    (0, vitest_1.it)("should create a new category with default position 0", async () => {
        const title = "new-" +
            faker_1.faker.commerce.department().toLowerCase() +
            "-" +
            faker_1.faker.number.int(10000);
        const res = await (0, supertest_1.default)(test_app_1.default).post("/auth/category/add").send({ title });
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body).toHaveProperty("id");
        (0, vitest_1.expect)(res.body).toHaveProperty("handle", (0, util_1.title_to_handle)(title));
        (0, vitest_1.expect)(res.body).toHaveProperty("position", 1);
    });
    (0, vitest_1.it)("should update an existing category", async () => {
        const repo = db_1.DB.getRepository(entities_1.Category);
        const all = await repo.find();
        (0, vitest_1.expect)(all.length).toBeGreaterThan(0);
        const existing = all[Math.floor(Math.random() * all.length)];
        const updated_title = "edit-" +
            faker_1.faker.commerce.department().toLowerCase() +
            "-" +
            faker_1.faker.number.int(10000);
        const res = await (0, supertest_1.default)(test_app_1.default).post(`/auth/category/${existing.id}`).send({
            title: updated_title,
            position: 5,
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toHaveProperty("id", existing.id);
        (0, vitest_1.expect)(res.body).toHaveProperty("handle", (0, util_1.title_to_handle)(updated_title));
    });
    (0, vitest_1.it)("should return 400 if title missing", async () => {
        const res = await (0, supertest_1.default)(test_app_1.default)
            .post("/auth/category/add")
            .send({ position: 2 });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.error).toMatch(/Missing required field: title/i);
    });
    (0, vitest_1.it)("should return 404 when editing non-existing category", async () => {
        const res = await (0, supertest_1.default)(test_app_1.default)
            .post("/auth/category/999999")
            .send({ title: "Doesn't Exist" });
        (0, vitest_1.expect)(res.status).toBe(404);
        (0, vitest_1.expect)(res.body.error).toMatch(/not found/i);
    });
});
(0, vitest_1.describe)("DELETE /auth/:model/:id", () => {
    (0, vitest_1.describe)("category", () => {
        (0, vitest_1.it)("should delete a category", async () => {
            const title = "delete-" +
                faker_1.faker.commerce.department().toLowerCase() +
                "-" +
                faker_1.faker.string.numeric(4);
            const created = await db_1.DB.getRepository(entities_1.Category).save({
                title,
                handle: (0, util_1.title_to_handle)(title),
                position: 0,
            });
            const res = await (0, supertest_1.default)(test_app_1.default).delete(`/auth/category/${created.id}`);
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body).toEqual({ success: true });
            const check = await db_1.DB.getRepository(entities_1.Category).findOneBy({
                id: created.id,
            });
            (0, vitest_1.expect)(check).toBeNull();
        });
        (0, vitest_1.it)("should return 404 when category not found", async () => {
            const res = await (0, supertest_1.default)(test_app_1.default).delete("/auth/category/999999");
            (0, vitest_1.expect)(res.status).toBe(404);
        });
    });
    (0, vitest_1.it)("should delete a product", async () => {
        const productData = await generateFakeProduct();
        // First create the product via the actual route (this ensures images are attached properly)
        const createRes = await (0, supertest_1.default)(test_app_1.default)
            .post("/auth/product/add")
            .send(productData);
        (0, vitest_1.expect)(createRes.status).toBe(201);
        const productId = createRes.body.id;
        // Now delete it
        const res = await (0, supertest_1.default)(test_app_1.default).delete(`/auth/product/${productId}`);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toEqual({ success: true });
        const check = await db_1.DB.getRepository(entities_1.Product).findOneBy({ id: productId });
        (0, vitest_1.expect)(check).toBeNull();
    });
    (0, vitest_1.it)("should return 400 for unsupported model", async () => {
        const res = await (0, supertest_1.default)(test_app_1.default).delete("/auth/unsupported/1");
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body).toHaveProperty("error", "Unsupported model");
    });
});
//# sourceMappingURL=crud.test.js.map