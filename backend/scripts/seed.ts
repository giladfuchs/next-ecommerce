import "reflect-metadata";
import dotenv from "dotenv";
import { CreateUser } from "./insert_user";
import { importMockData } from "./mock_data";

dotenv.config();
/**
 Seed the database (only when SEED=true is set)

 ➤ Import mock data only:
 pnpm tsx scripts/seed.ts

 ➤ Import mock data + create a custom user:
 SEED=true pnpm tsx scripts/seed.ts --user=admin,my@email.com,admin

 ⚠️ If SEED=true is not set, this script will use your default DB config — possibly production!

 🔁 To reset the database before seeding, use:
 SEED=true pnpm tsx scripts/reset_db.ts
 */

async function runSeed() {
  const userFlag = process.argv.find((arg) => arg.startsWith("--user="));

  if (userFlag) {
    const [, userData] = userFlag.split("=");
    const [username, email, password] = userData.split(",");

    if (!username || !email || !password) {
      console.error("❌ Invalid format. Use --user=username,email,password");
      process.exit(1);
    }

    await CreateUser(username, email, password);
    console.log("✅ User created:", email);
  }

  try {
    await importMockData();
    console.log("✅ Mock data imported.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to import mock data:", err);
    process.exit(1);
  }
}

runSeed();
