import { defineConfig } from "@playwright/test";
export { ModelType as TestModelType } from "@/lib/types/enums";
export const TEST_BASE_URL = "http://localhost:3000";
export default defineConfig({
  testDir: "./e2e",
  retries: 1,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: TEST_BASE_URL,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "pnpm dev:webpack",
    port: 3000,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
