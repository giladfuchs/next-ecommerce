import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();
import SeedService from "./index";

// pnpm tsx  seed/run.ts
export const resetDb = async () => {
  const { execSync } = await import("node:child_process");

  execSync("yes | payload migrate:fresh", {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32" ? "cmd.exe" : "/bin/sh",
  });
};

async function run() {
  await resetDb();
  await new SeedService("seed").run();

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
