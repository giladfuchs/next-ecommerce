import "reflect-metadata";
import fs from "fs/promises";
import dotenv from "dotenv";

dotenv.config();

import { DB } from "../src/lib/db";
import { Order } from "../src/lib/entities";
import { PublicController } from "../src/controller/public";

const MOCK_DATA_PATH = "scripts/mock-data.json";
/**
 * Dumps products, categories (via PublicController), and orders to mock-data.json.
 * The format matches the public API response and is used directly for mock mode in the frontend.
 */

async function DBToJsonForMockMode(): Promise<void> {
  const orders = await DB.getRepository(Order).find({ relations: ["items"] });
  const { products, categories } = await PublicController.getData();


  const data = { products, categories, orders };

  await fs.writeFile(MOCK_DATA_PATH, JSON.stringify(data, null, 2), "utf8");
  console.log(`✅ Mock data exported to ${MOCK_DATA_PATH}`);
}

/**
 * Registers a new user via the PublicController register logic.
 */
async function createUser(
  username: string,
  email: string,
  password: string,
): Promise<void> {

  await PublicController.register({ username, email, password });
  console.log(`✅ Created user: ${username}`);
}

/**
 * Drops and recreates the entire public schema.
 */
async function resetSchema(): Promise<void> {
  await PublicController.resetMockDb();
  return
  const em = DB.manager;
  console.log("🧨 Dropping and recreating public schema...");
  await em.query(`DROP SCHEMA public CASCADE;`);
  await em.query(`CREATE SCHEMA public;`);
  console.log("✅ Schema reset.");
}

/**
 * Drops selected tables manually.
 * Comment/uncomment the ones you want to keep or remove.
 */
async function deleteModels(): Promise<void> {
  const em = DB.manager;
  console.log("🧨 Dropping selected tables...");

  await em.query(`DROP TABLE IF EXISTS "product_image" CASCADE;`);
  await em.query(`DROP TABLE IF EXISTS "product" CASCADE;`);
  await em.query(`DROP TABLE IF EXISTS "category" CASCADE;`);
  await em.query(`DROP TABLE IF EXISTS "order_item" CASCADE;`);
  await em.query(`DROP TABLE IF EXISTS "order" CASCADE;`);
  // await em.query(`DROP TABLE IF EXISTS "user" CASCADE;`);

  console.log("✅ Tables dropped.");
}

/**
 * Example usage — comment/uncomment as needed
 *
 * With seed DB (local Docker):
 SEED=true pnpm tsx scripts/dev_db_tools.ts
 *
 * Without SEED (default DB config - possibly production!):
 pnpm tsx scripts/dev_db_tools.ts
 *
 * ⚠️ WARNING: If SEED=true is not set, this script will use your default DB config — possibly production!
 * This script is intended for local development with a local DB (e.g. Docker).
 */

DB.initialize()
  .then(async () => {
    // await DBToJsonForMockMode();
    await resetSchema();
    // await createUser("admin", "admin@admin.com", "admin");
    // await deleteModels();
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Failed to run dev_db_tools script", err);
    process.exit(1);
  });
