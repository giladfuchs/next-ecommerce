import { beforeAll, beforeEach } from "vitest";
import "reflect-metadata";
import { DB } from "../src/lib/db";

process.env.NODE_ENV = "test";

beforeAll(async () => {
  if (!DB.isInitialized) {
    await DB.initialize();
    console.log("✅ Test DB initialized (from setup)");
  }
});

beforeEach(async () => {});
