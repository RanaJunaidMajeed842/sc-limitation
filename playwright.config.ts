import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    serviceWorkers: "allow",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium", channel: process.env.PLAYWRIGHT_CHANNEL || "chrome" },
    },
    {
      name: "webkit-mobile",
      testMatch: "date-layout.spec.ts",
      use: { ...devices["iPhone 13"], browserName: "webkit" },
    },
  ],
  webServer: {
    command: "npm run start -- --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
