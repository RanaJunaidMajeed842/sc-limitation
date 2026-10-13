import { test, expect } from "@playwright/test";

test("legal reader is navigable on phone and desktop and preserves case inputs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Ready for offline use", { exact: true })).toBeVisible();
  await page.locator("#reference").fill("Case retained while reading");
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const trigger = page.getByRole("button", { name: "Relevant laws", exact: true });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Relevant laws", exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Source status", { exact: true })).toBeVisible();
    const contents = dialog.getByRole("navigation", { name: "Legal reference contents" });
    await contents.getByRole("button", { name: /Filing periods/ }).click();
    await expect(dialog.getByRole("heading", { name: "Filing periods at a glance" })).toBeInViewport();
    await expect(dialog.getByRole("heading", { name: "Jail petition for leave to appeal", exact: true })).toHaveCount(1);
    await contents.getByRole("button", { name: /Statutory provisions/ }).click();
    await expect(dialog.getByRole("heading", { name: "The Limitation Act, 1908", exact: true })).toBeInViewport();
    await contents.getByRole("button", { name: /Sources & citations/ }).click();
    await expect(dialog.getByRole("heading", { name: "Sources & citations", exact: true })).toBeInViewport();
    await expect(dialog.getByRole("link", { name: /Limitation Act, 1908 — Pakistan Code/ })).toHaveAttribute("href", /pakistancode\.gov\.pk/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(page.locator("#reference")).toHaveValue("Case retained while reading");
  }
});

test("legal reference remains readable after an offline PWA restart", async ({ page, context }) => {
  await page.goto("/");
  await expect(page.getByText("Ready for offline use", { exact: true })).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: "Relevant laws", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Relevant laws", exact: true });
  await dialog.getByRole("button", { name: /Statutory provisions/ }).click();
  await expect(dialog.getByRole("heading", { name: "The Limitation Act, 1908", exact: true })).toBeInViewport();
  await expect(dialog.getByText("Section 12(2)", { exact: true })).toHaveCount(1);
  await dialog.getByRole("button", { name: /Sources & citations/ }).click();
  await expect(dialog.getByText(/External sources require an internet connection/)).toBeVisible();
});
