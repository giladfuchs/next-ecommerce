import "reflect-metadata";
import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "./test-app";
import { DB } from "../src/lib/db";
import { Product, Category } from "../src/lib/entities";
import { faker } from "@faker-js/faker";
import { title_to_handle } from "../src/lib/util";

const getValidCategoryId = async (): Promise<number> => {
  const categories = await DB.getRepository(Category).find();
  if (!categories.length) throw new Error("No categories in DB");
  return categories[Math.floor(Math.random() * categories.length)].id;
};

const generateFakeProduct = async () => ({
  title: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  price: parseFloat(faker.commerce.price()),
  category_id: await getValidCategoryId(),
  available: true,
  images: [
    {
      url: faker.image.url(),
      altText: faker.commerce.productAdjective(),
    },
  ],
});
describe("POST /auth/product/:add_or_id", () => {
  let createdProductId: number;

  it("should create a new product", async () => {
    const productData = await generateFakeProduct();

    const res = await request(app).post("/auth/product/add").send(productData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("images");
    expect(Array.isArray(res.body.images)).toBe(true);

    createdProductId = res.body.id;
  });

  it("should update an existing product", async () => {
    const updatedData = await generateFakeProduct();
    updatedData.title = "[EDITED] " + updatedData.title;

    const res = await request(app)
      .post(`/auth/product/${createdProductId}`)
      .send(updatedData);

    expect(res.status).toBe(200);
    expect(res.body.title).toContain("[EDITED]");
    expect(res.body.id).toBe(createdProductId);
  });

  it("should return 400 if images are missing", async () => {
    const productData = await generateFakeProduct();
    delete (productData as any).images;

    const res = await request(app).post("/auth/product/add").send(productData);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Missing required field: images/i);
  });

  it("should return 400 if title missing", async () => {
    const productData = await generateFakeProduct();
    delete (productData as any).title;

    const res = await request(app).post("/auth/product/add").send(productData);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/handle|title/i);
  });
});

describe("POST /auth/category/:add_or_id", () => {
  it("should create a new category with default position 0", async () => {
    const title =
      "new-" +
      faker.commerce.department().toLowerCase() +
      "-" +
      faker.number.int(10000);

    const res = await request(app).post("/auth/category/add").send({ title });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("handle", title_to_handle(title));
    expect(res.body).toHaveProperty("position", 1);
  });

  it("should update an existing category", async () => {
    const repo = DB.getRepository(Category);
    const all = await repo.find();

    expect(all.length).toBeGreaterThan(0);
    const existing = all[Math.floor(Math.random() * all.length)];

    const updated_title =
      "edit-" +
      faker.commerce.department().toLowerCase() +
      "-" +
      faker.number.int(10000);

    const res = await request(app).post(`/auth/category/${existing.id}`).send({
      title: updated_title,
      position: 5,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", existing.id);
    expect(res.body).toHaveProperty("handle", title_to_handle(updated_title));
  });
  it("should return 400 if title missing", async () => {
    const res = await request(app)
      .post("/auth/category/add")
      .send({ position: 2 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Missing required field: title/i);
  });

  it("should return 404 when editing non-existing category", async () => {
    const res = await request(app)
      .post("/auth/category/999999")
      .send({ title: "Doesn't Exist" });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });
});

describe("DELETE /auth/:model/:id", () => {
  describe("category", () => {
    it("should delete a category", async () => {
      const title =
        "delete-" +
        faker.commerce.department().toLowerCase() +
        "-" +
        faker.string.numeric(4);
      const created = await DB.getRepository(Category).save({
        title,
        handle: title_to_handle(title),
        position: 0,
      });

      const res = await request(app).delete(
        `/auth/category/${created.id}/delete`,
      );
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });

      const check = await DB.getRepository(Category).findOneBy({
        id: created.id,
      });
      expect(check).toBeNull();
    });

    it("should return 404 when category not found", async () => {
      const res = await request(app).delete("/auth/category/999999/delete");
      expect(res.status).toBe(404);
    });
  });

  it("should delete a product", async () => {
    const productData = await generateFakeProduct();

    // First create the product via the actual route (this ensures images are attached properly)
    const createRes = await request(app)
      .post("/auth/product/add")
      .send(productData);

    expect(createRes.status).toBe(201);
    const productId = createRes.body.id;

    // Now delete it
    const res = await request(app).delete(`/auth/product/${productId}/delete`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });

    const check = await DB.getRepository(Product).findOneBy({ id: productId });
    expect(check).toBeNull();
  });

  it("should return 400 for unsupported model", async () => {
    const res = await request(app).delete("/auth/unsupported/1/delete");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Unsupported model");
  });
});
