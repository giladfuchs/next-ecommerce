"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/codegen.ts
const child_process_1 = require("child_process");
const TEST_PORT = 4010;
console.log("🚀 Starting yaara-api in test mode (port:", TEST_PORT, ")");
const apiProcess = (0, child_process_1.spawn)("pnpm", ["dev"], {
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
    (0, child_process_1.spawn)("pnpm", ["exec", "playwright", "codegen", "http://localhost:3000"], {
        stdio: "inherit",
        shell: true,
    });
}, 2000);
//# sourceMappingURL=codegen.js.map