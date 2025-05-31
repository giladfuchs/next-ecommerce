"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delete_models = delete_models;
require("reflect-metadata");
const db_1 = require("../src/lib/db");
async function resetTables() {
    const em = db_1.DB.manager;
    console.log("🧨 Dropping and recreating public schema...");
    await em.query(`DROP SCHEMA public CASCADE;`);
    await em.query(`CREATE SCHEMA public;`);
    console.log("✅ Schema reset.");
}
async function delete_models() {
    const em = db_1.DB.manager;
    console.log("🧨 Dropping product-related tables...");
    await em.query(`DROP TABLE IF EXISTS "product_image" CASCADE;`);
    await em.query(`DROP TABLE IF EXISTS "product" CASCADE;`);
    await em.query(`DROP TABLE IF EXISTS "category" CASCADE;`);
    await em.query(`DROP TABLE IF EXISTS "order_item" CASCADE;`);
    await em.query(`DROP TABLE IF EXISTS "order" CASCADE;`);
    // await em.query(`DROP TABLE IF EXISTS "user" CASCADE;`);
    console.log("✅ Tables dropped.");
}
db_1.DB.initialize()
    .then(async () => {
    await delete_models();
    process.exit();
})
    .catch((err) => {
    console.error("❌ Failed to run seed script", err);
    process.exit(1);
});
//# sourceMappingURL=reset_db.js.map