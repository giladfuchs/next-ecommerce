import "reflect-metadata";
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "./test-app";
import { DB } from "../src/lib/db";
import { Product } from "../src/lib/entities";
import { faker } from "@faker-js/faker";

describe("POST /checkout", () => {
  it("should submit a valid order and return 201", async () => {
    const products = await DB.getRepository(Product).find({
      relations: ["images"],
    });

    const product = products[Math.floor(Math.random() * products.length)];
    const image = product.images[0];

    const res = await request(app)
      .post("/checkout")
      .send({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: `05${faker.string.numeric(8)}`,
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

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.items.length).toBe(1);
  });

  it("should return 400 if cart is missing or invalid", async () => {
    const res = await request(app).post("/checkout").send({
      name: "Test User",
      email: "test@example.com",
      phone: "050-0000000",
      cart: {}, // missing lines
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Order must contain at least one item");
  });

  it("should fail if required fields like name are missing", async () => {
    const products = await DB.getRepository(Product).find({
      relations: ["images"],
    });

    const product = products[Math.floor(Math.random() * products.length)];
    const image = product.images[0];

    const res = await request(app)
      .post("/checkout")
      .send({
        email: faker.internet.email(),
        phone: `05${faker.string.numeric(8)}`,
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
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing required field: name");
  });

  it("should return 400 if cart has no product lines", async () => {
    const res = await request(app)
      .post("/checkout")
      .send({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: `05${faker.string.numeric(8)}`,
        cart: {
          totalQuantity: 0,
          cost: 0,
          lines: [], // empty lines
          createdAt: Date.now(),
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Order must contain at least one item");
  });
});

describe("GET /data", () => {
  it("should return products and categories with formatted structure", async () => {
    const res = await request(app).get("/data");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("products");
    expect(res.body).toHaveProperty("categories");

    const { products, categories } = res.body;

    expect(Array.isArray(products)).toBe(true);
    expect(Array.isArray(categories)).toBe(true);

    for (const product of products) {
      expect(product).toHaveProperty("id");
      expect(product).toHaveProperty("title");
      expect(product).toHaveProperty("featuredImage");
      expect(product).toHaveProperty("category");
    }
  });
});
