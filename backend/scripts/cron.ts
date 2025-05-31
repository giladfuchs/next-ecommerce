import "reflect-metadata";
import { DB } from "../src/lib/db";
import { delete_models } from "./reset_db";
import { importMockData } from "./mock_data";
DB.initialize()
  .then(async () => {
    // await delete_models();
    await importMockData();

    process.exit();
  })
  .catch((err) => {
    console.error("❌ Failed to run seed script", err);
    process.exit(1);
  });
