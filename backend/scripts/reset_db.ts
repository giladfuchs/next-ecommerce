import "reflect-metadata";
import { DB } from "../src/lib/db";

async function resetTables() {
  const em = DB.manager;
  console.log("🧨 Dropping and recreating public schema...");
  await em.query(`DROP SCHEMA public CASCADE;`);
  await em.query(`CREATE SCHEMA public;`);
  console.log("✅ Schema reset.");
}

export async function delete_models() {
  const em = DB.manager;

  console.log("🧨 Dropping product-related tables...");
  await em.query(`DROP TABLE IF EXISTS "product_image" CASCADE;`);
  await em.query(`DROP TABLE IF EXISTS "product" CASCADE;`);
  await em.query(`DROP TABLE IF EXISTS "category" CASCADE;`);
  await em.query(`DROP TABLE IF EXISTS "order_item" CASCADE;`);
  await em.query(`DROP TABLE IF EXISTS "order" CASCADE;`);
  // await em.query(`DROP TABLE IF EXISTS "user" CASCADE;`);
  console.log("✅ Tables dropped.");
}

DB.initialize()
  .then(async () => {
    await delete_models();
    process.exit();
  })
  .catch((err) => {
    console.error("❌ Failed to run seed script", err);
    process.exit(1);
  });
