// scripts/codegen.ts
import { spawn } from "child_process";

const TEST_PORT = 4010;

console.log("🚀 Starting yaara-api in test mode (port:", TEST_PORT, ")");

const apiProcess = spawn("pnpm", ["dev"], {
  cwd: "../yaara-api",
  env: {
    ...process.env,
    NODE_ENV: "test",
    PORT: TEST_PORT.toString(),
    SEED: "true",
  },
  stdio: "inherit",
  shell: true,
});

// After short delay, open codegen
setTimeout(() => {
  console.log("🎥 Launching Playwright Codegen...");
  spawn("pnpm", ["exec", "playwright", "codegen", "http://localhost:3000"], {
    stdio: "inherit",
    shell: true,
  });
}, 2000);
