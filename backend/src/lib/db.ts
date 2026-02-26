import dotenv from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";
import {
  Category,
  Order,
  OrderItem,
  Product,
  ProductImage,
  User,
} from "./entities";
import { Request, Response, NextFunction } from "express";
import { OrderSubscriber, ProductSubscriber } from "./subscribers";

dotenv.config();
const entities = [Product, Category, ProductImage, Order, OrderItem, User];
const isTest = process.env.NODE_ENV === "test";

const isSeed = process.env.SEED === "true";

const options: DataSourceOptions =
  isSeed || isTest
    ? ({
        type: "postgres",
        host: "localhost",
        port: 5433,
        username: "test",
        password: "test",
        database: "ecommerce_test",
        synchronize: true,
        logging: false,
        entities,
        subscribers: [ProductSubscriber, OrderSubscriber],
      } as DataSourceOptions)
    : ({
        type: "postgres",
        url: process.env.DATABASE_URL,
        synchronize: true,
        // synchronize:process.env.NODE_ENV !== "production",
        logging: false,
        entities,
        subscribers: [ProductSubscriber, OrderSubscriber],
      } as DataSourceOptions);

export const DB = new DataSource(options);

let initialized = false;

export async function initDBMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!initialized) {
      await DB.initialize();
      initialized = true;
      console.log("✅ DB initialized (via middleware)");
    }
    next();
  } catch (err) {
    console.error("❌ DB initialization error:", err);
    res.status(500).json({ error: "Database initialization failed" });
  }
}
