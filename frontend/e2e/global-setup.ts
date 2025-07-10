// e2e/global-setup.ts
import { spawn } from "child_process";

let serverProcess: ReturnType<typeof spawn>;
export const TEST_BASE_URL = "http://localhost:3001";
export default async () => {
  serverProcess = spawn("pnpm", ["dev"], {
    cwd: "../backend",
    env: {
      ...process.env,
      NODE_ENV: "test",
      PORT: "4013",
      SEED: "true",
    },
    stdio: "inherit",
    shell: true,
  });
};
