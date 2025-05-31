"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const test_app_1 = __importDefault(require("./test-app"));
const entities_1 = require("../src/lib/entities");
const db_1 = require("../src/lib/db");
const util_1 = require("../src/lib/util");
async function getRandomOrder() {
    const repo = db_1.DB.getRepository(entities_1.Order);
    const orders = await repo.find({ relations: ["items"] });
    (0, vitest_1.expect)(orders.length).toBeGreaterThan(0);
    return orders[Math.floor(Math.random() * orders.length)];
}
(0, vitest_1.describe)("GET /admin/order/:id", () => {
    (0, vitest_1.it)("should return an order by ID", async () => {
        const randomOrder = await getRandomOrder();
        const res = await (0, supertest_1.default)(test_app_1.default).get(`/auth/order/${randomOrder.id}`);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toHaveProperty("id", randomOrder.id);
        (0, vitest_1.expect)(Array.isArray(res.body.items)).toBe(true);
    });
    (0, vitest_1.it)("should return 404 if order does not exist", async () => {
        const res = await (0, supertest_1.default)(test_app_1.default).get("/auth/order/999999");
        (0, vitest_1.expect)(res.status).toBe(404);
    });
});
(0, vitest_1.describe)("POST /auth/order/status", () => {
    let orderId;
    (0, vitest_1.beforeEach)(async () => {
        const randomOrder = await getRandomOrder();
        orderId = randomOrder.id;
    });
    (0, vitest_1.it)("should update order status properly", async () => {
        const res = await (0, supertest_1.default)(test_app_1.default).post("/auth/order/status").send({
            id: orderId,
            status: util_1.OrderStatus.READY,
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toHaveProperty("id", orderId);
        (0, vitest_1.expect)(res.body).toHaveProperty("status", util_1.OrderStatus.READY);
    });
    (0, vitest_1.it)("should return 500 if status is not in the enum", async () => {
        const res = await (0, supertest_1.default)(test_app_1.default).post("/auth/order/status").send({
            id: orderId,
            status: "invalid_status",
        });
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body.error).toMatch(/invalid input value/i);
    });
    (0, vitest_1.it)("should return 404 if order ID does not exist", async () => {
        const res = await (0, supertest_1.default)(test_app_1.default).post("/auth/order/status").send({
            id: 999999,
            status: util_1.OrderStatus.CANCELED,
        });
        (0, vitest_1.expect)(res.status).toBe(404);
        (0, vitest_1.expect)(res.body.error).toMatch(/not found/i);
    });
});
(0, vitest_1.describe)("GET /auth/orders", () => {
    (0, vitest_1.it)("should return a list of orders", async () => {
        const res = await (0, supertest_1.default)(test_app_1.default).get("/auth/orders");
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(Array.isArray(res.body)).toBe(true);
        if (res.body.length > 0) {
            (0, vitest_1.expect)(res.body[0]).toHaveProperty("id");
            (0, vitest_1.expect)(Array.isArray(res.body[0].items)).toBe(true);
        }
    });
});
//# sourceMappingURL=order.test.js.map