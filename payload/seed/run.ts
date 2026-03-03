import "dotenv/config";
import dotenv from "dotenv";

dotenv.config();
import { run_seed_reset } from "./seedData";

if (import.meta.url === `file://${process.argv[1]}`) {
  run_seed_reset("seed")
    .then(() => {
      console.log("✅ Seed finished");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Seed failed", err);
      process.exit(1);
    });
}
