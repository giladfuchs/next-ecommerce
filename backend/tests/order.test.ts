import "reflect-metadata";
import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "./test-app";
import { Order } from "../src/lib/entities";
import { DB } from "../src/lib/db";
import { OrderStatus } from "../src/lib/util";

async function getRandomOrder(): Promise<Order> {
  const repo = DB.getRepository(Order);
  const orders = await repo.find({ relations: ["items"] });

  expect(orders.length).toBeGreaterThan(0);
  return orders[Math.floor(Math.random() * orders.length)];
}

describe("GET /admin/order/:id", () => {
  it("should return an order by ID", async () => {
    const randomOrder = await getRandomOrder();

    const res = await request(app).get(`/auth/order/${randomOrder.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", randomOrder.id);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it("should return 404 if order does not exist", async () => {
    const res = await request(app).get("/auth/order/999999");
    expect(res.status).toBe(404);
  });
});

describe("POST /auth/order/status", () => {
  let orderId: number;

  beforeEach(async () => {
    const randomOrder = await getRandomOrder();

    orderId = randomOrder.id;
  });

  it("should update order status properly", async () => {
    const res = await request(app).post("/auth/order/status").send({
      id: orderId,
      status: OrderStatus.READY,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", orderId);
    expect(res.body).toHaveProperty("status", OrderStatus.READY);
  });

  it("should return 500 if status is not in the enum", async () => {
    const res = await request(app).post("/auth/order/status").send({
      id: orderId,
      status: "invalid_status",
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/invalid input value/i);
  });

  it("should return 404 if order ID does not exist", async () => {
    const res = await request(app).post("/auth/order/status").send({
      id: 999999,
      status: OrderStatus.CANCELED,
    });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });
});

describe("GET /auth/orders", () => {
  it("should return a list of orders", async () => {
    const res = await request(app).get("/auth/orders");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty("id");
      expect(Array.isArray(res.body[0].items)).toBe(true);
    }
  });
});
