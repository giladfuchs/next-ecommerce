import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import { DB } from "../src/lib/db";
import { Product } from "../src/lib/entities";

async function price(): Promise<void> {
  await DB.initialize();

  const products = await DB.getRepository(Product).find({
    relations: ["images"],
    order: {
      updatedAt: "DESC",
      images: { position: "ASC" },
    },
  });

  for (const p of products) {
    p.price = Math.round(p.price * 0.75);
    console.log(p.price);
  }

  await DB.getRepository(Product).save(products);
}
(async () => {
  try {
    await price();
    process.exit(0);
  } catch (err) {
    console.error("❌  script failed:", err);
    process.exit(1);
  }
})();
