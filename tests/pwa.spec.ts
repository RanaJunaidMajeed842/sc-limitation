import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("serves installable metadata, app icons and an uncached service worker", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.getByText("Ready for offline use", { exact: true })).toBeVisible();
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/manifest.webmanifest");
  await expect(page.locator('meta[name="mobile-web-app-capable"]')).toHaveAttribute("content", "yes");
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute("href", "/icons/apple-touch-icon.png");
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.start_url).toBe("/");
  expect(manifest.scope).toBe("/");
  for (const icon of manifest.icons) {
    const response = await request.get(icon.src);
    expect(response.ok()).toBe(true);
    const bytes = await response.body();
    expect(bytes.subarray(1, 4).toString()).toBe("PNG");
    expect(`${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`).toBe(icon.sizes);
  }
  const worker = await request.get("/sw.js");
  expect(worker.headers()["cache-control"]).toContain("no-store");
  expect(await worker.text()).not.toContain("__PRECACHE_ASSETS__");
});

test("first PDF export works after an offline restart on a narrow phone screen", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByText("Ready for offline use", { exact: true })).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Every day counts." })).toBeVisible();
  await expect(page.getByText("Offline — calculations and PDF export remain available. Sharing needs a connection.")).toBeVisible();
  await page.locator("#impugnedDate").fill("2026-01-01");
  await page.locator("#filingDate").fill("2026-02-10");
  await page.locator("#copyApplyDate").fill("2026-01-05");
  await page.locator("#copyGettingDate").fill("2026-01-15");
  await page.locator("#givenCopyTime").fill("30");
  await page.locator("#publicHolidays").fill("2");
  await page.getByRole("button", { name: "Calculate limitation" }).click();
  await expect(page.getByText("3 days remaining", { exact: true })).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save PDF" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("limitation-report-2026-02-10.pdf");
  const filePath = await download.path();
  expect((await readFile(filePath!)).subarray(0, 5).toString()).toBe("%PDF-");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("iPhone users receive Safari home-screen installation instructions", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1",
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3100");
  await page.getByRole("button", { name: "Install app", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Open this website in Safari.");
  await expect(page.getByRole("dialog")).toContainText("Add to Home Screen");
  await expect(page.getByRole("button", { name: "Install on this device" })).toHaveCount(0);
  await context.close();
});

test("copy-time rules and explanations stay consistent in results, PDF and WhatsApp", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Ready for offline use", { exact: true })).toBeVisible();
  await page.locator("#impugnedDate").fill("2026-01-01");
  await page.locator("#filingDate").fill("2026-01-04");
  await page.locator("#copyApplyDate").fill("2026-01-01");
  await page.locator("#copyGettingDate").fill("2026-01-03");
  await page.locator("#givenCopyTime").fill("60");
  await page.getByRole("button", { name: "Calculate limitation" }).click();
  await expect(page.getByLabel("Copy-time adjustment")).toContainText("first day is excluded");
  await expect(page.locator("dl > div").filter({ hasText: "Copy time counted" })).toContainText("2 days");

  await page.locator("#copyApplyDate").fill("2026-01-02");
  await page.getByRole("button", { name: "Calculate limitation" }).click();
  await expect(page.getByLabel("Copy-time adjustment")).toHaveCount(0);
  await expect(page.locator("dl > div").filter({ hasText: "Copy time counted" })).toContainText("2 days");

  await page.locator("#filingDate").fill("2026-03-10");
  await page.locator("#copyApplyDate").fill("2026-03-02");
  await page.locator("#copyGettingDate").fill("2026-03-04");
  await page.getByRole("button", { name: "Calculate limitation" }).click();
  await expect(page.getByLabel("Copy-time adjustment")).toHaveCount(0);
  await expect(page.locator("dl > div").filter({ hasText: "Copy time counted" })).toContainText("3 days");

  await page.locator("#copyApplyDate").fill("2026-03-03");
  await page.getByRole("button", { name: "Calculate limitation" }).click();
  await expect(page.getByLabel("Copy-time adjustment")).toContainText("61 elapsed days");
  await expect(page.locator("dl > div").filter({ hasText: "Copy time counted" })).toContainText("0 days");
  await expect(page.locator("dl > div").filter({ hasText: "Total copy time" })).toContainText("60 days");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save PDF" }).click();
  const download = await downloadPromise;
  const content = (await readFile((await download.path())!)).toString();
  expect(content).toContain("Copy-time adjustment");
  expect(content).toContain("Copy time is 0 days");

  await page.evaluate(() => { window.open = url => { document.documentElement.dataset.sharedUrl = String(url); return null; }; });
  await page.getByRole("button", { name: "Share report" }).click();
  await page.getByRole("button", { name: "Send summary on WhatsApp" }).click();
  const sharedUrl = await page.locator("html").getAttribute("data-shared-url");
  const summary = new URL(sharedUrl!).searchParams.get("text");
  expect(summary).toContain("Copy time counted: 0 days");
  expect(summary).toContain("61 elapsed days");
});

test("native install prompt is used once and installed apps hide install controls", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Install app", exact: true })).toBeVisible();
  await page.evaluate(() => {
    const event = new Event("beforeinstallprompt", { cancelable: true });
    Object.assign(event, {
      prompt: async () => { document.documentElement.dataset.installPrompted = "yes"; },
      userChoice: Promise.resolve({ outcome: "accepted" }),
    });
    window.dispatchEvent(event);
  });
  await page.getByRole("button", { name: "Install app", exact: true }).click();
  await page.getByRole("button", { name: "Install on this device" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-install-prompted", "yes");
  await expect(page.getByRole("button", { name: "Install on this device" })).toHaveCount(0);
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.evaluate(() => window.dispatchEvent(new Event("appinstalled")));
  await expect(page.getByRole("button", { name: "Install app", exact: true })).toHaveCount(0);
});
