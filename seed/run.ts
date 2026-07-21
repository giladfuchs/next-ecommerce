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

/*
TEMP FIX: Payload CLI env loader crash (Node 22 + @next/env)

node -e "
const fs = require('fs');
const path = 'node_modules/.pnpm/payload@3.81.0_graphql@16.13.2_typescript@5.9.3/node_modules/payload/dist/bin/loadEnv.js';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(
  \"import nextEnvImport from '@next/env';\",
  \"import * as nextEnvImport from '@next/env';\"
);
fs.writeFileSync(path, content);
console.log('Patched!');
"

*/
