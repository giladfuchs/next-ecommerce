"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const test_app_1 = __importDefault(require("./test-app"));
const db_1 = require("../src/lib/db");
const entities_1 = require("../src/lib/entities");
const faker_1 = require("@faker-js/faker");
(0, vitest_1.describe)("POST /checkout", () => {
    (0, vitest_1.it)("should submit a valid order and return 201", async () => {
        const products = await db_1.DB.getRepository(entities_1.Product).find({
            relations: ["images"],
        });
        const product = products[Math.floor(Math.random() * products.length)];
        const image = product.images[0];
        const res = await (0, supertest_1.default)(test_app_1.default)
            .post("/checkout")
            .send({
            name: faker_1.faker.person.fullName(),
            email: faker_1.faker.internet.email(),
            phone: `05${faker_1.faker.string.numeric(8)}`,
            cart: {
                totalQuantity: 1,
                cost: product.price,
                lines: [
                    {
                        productId: product.id,
                        handle: product.handle,
                        title: product.title,
                        imageUrl: image.url,
                        imageAlt: image.altText,
                        quantity: 1,
                        unitAmount: product.price,
                        totalAmount: product.price,
                    },
                ],
                createdAt: Date.now(),
            },
        });
        (0, vitest_1.expect)(res.statusCode).toBe(201);
        (0, vitest_1.expect)(res.body).toHaveProperty("id");
        (0, vitest_1.expect)(res.body.items.length).toBe(1);
    });
    (0, vitest_1.it)("should return 400 if cart is missing or invalid", async () => {
        const res = await (0, supertest_1.default)(test_app_1.default).post("/checkout").send({
            name: "Test User",
            email: "test@example.com",
            phone: "050-0000000",
            cart: {}, // missing lines
        });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.error).toBe("Order must contain at least one item");
    });
    (0, vitest_1.it)("should fail if required fields like name are missing", async () => {
        const products = await db_1.DB.getRepository(entities_1.Product).find({
            relations: ["images"],
        });
        const product = products[Math.floor(Math.random() * products.length)];
        const image = product.images[0];
        const res = await (0, supertest_1.default)(test_app_1.default)
            .post("/checkout")
            .send({
            email: faker_1.faker.internet.email(),
            phone: `05${faker_1.faker.string.numeric(8)}`,
            cart: {
                totalQuantity: 1,
                cost: product.price,
                lines: [
                    {
                        productId: product.id,
                        handle: product.handle,
                        title: product.title,
                        imageUrl: image.url,
                        imageAlt: image.altText,
                        quantity: 1,
                        unitAmount: product.price,
                        totalAmount: product.price,
                    },
                ],
                createdAt: Date.now(),
            },
        });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.error).toBe("Missing required field: name");
    });
    (0, vitest_1.it)("should return 400 if cart has no product lines", async () => {
        const res = await (0, supertest_1.default)(test_app_1.default)
            .post("/checkout")
            .send({
            name: faker_1.faker.person.fullName(),
            email: faker_1.faker.internet.email(),
            phone: `05${faker_1.faker.string.numeric(8)}`,
            cart: {
                totalQuantity: 0,
                cost: 0,
                lines: [], // empty lines
                createdAt: Date.now(),
            },
        });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.error).toBe("Order must contain at least one item");
    });
});
(0, vitest_1.describe)("GET /data", () => {
    (0, vitest_1.it)("should return products and categories with formatted structure", async () => {
        const res = await (0, supertest_1.default)(test_app_1.default).get("/data");
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toHaveProperty("products");
        (0, vitest_1.expect)(res.body).toHaveProperty("categories");
        const { products, categories } = res.body;
        (0, vitest_1.expect)(Array.isArray(products)).toBe(true);
        (0, vitest_1.expect)(Array.isArray(categories)).toBe(true);
        for (const product of products) {
            (0, vitest_1.expect)(product).toHaveProperty("id");
            (0, vitest_1.expect)(product).toHaveProperty("title");
            (0, vitest_1.expect)(product).toHaveProperty("featuredImage");
            (0, vitest_1.expect)(product).toHaveProperty("category");
        }
    });
});
//# sourceMappingURL=public.test.js.map