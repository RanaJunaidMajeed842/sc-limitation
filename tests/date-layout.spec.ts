import { test, expect } from "@playwright/test";

const dateIds = ["impugnedDate", "filingDate", "copyApplyDate", "copyGettingDate"];
const dateValues = ["2026-08-08", "2026-10-11", "2026-08-15", "2026-09-30"];

test("date fields fill their columns and match allowance fields when empty or populated", async ({ page }) => {
  await page.goto("/");
  // Wait for React to hydrate before changing controlled inputs.
  await expect(page.getByRole("button", { name: "Install app", exact: true })).toBeVisible();
  if (await page.locator("#impugnedDate").evaluate(input => (input as HTMLInputElement).type !== "date")) {
    test.info().annotations.push({ type: "limitation", description: "This WebKit build falls back to text inputs for dates. It verifies fallback layout; native iOS picker sizing requires a physical-device check." });
  }
  for (const width of [320, 375, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const dark of [false, true]) {
      await page.evaluate(enabled => document.documentElement.classList.toggle("dark", enabled), dark);
      for (const populated of [false, true]) {
        for (const [index, id] of dateIds.entries()) await page.locator(`#${id}`).fill(populated ? dateValues[index] : "");
        const sizes = await page.evaluate(ids => {
          const allowance = document.querySelector<HTMLInputElement>("#givenCopyTime")!.getBoundingClientRect();
          return ids.map(id => {
            const input = document.getElementById(id) as HTMLInputElement;
            const box = input.getBoundingClientRect();
            const parent = input.parentElement!.getBoundingClientRect();
            return { id, width: box.width, columnWidth: parent.width, allowanceWidth: allowance.width, height: box.height, allowanceHeight: allowance.height, left: box.left, right: box.right, type: input.getAttribute("type") };
          });
        }, dateIds);
        for (const size of sizes) {
          const label = `${size.id}, ${width}px, ${dark ? "dark" : "light"}, ${populated ? "populated" : "empty"}`;
          expect(Math.abs(size.width - size.columnWidth), label).toBeLessThanOrEqual(1);
          // Tablet grids intentionally use different gaps (16px dates, 20px allowances).
          if (width < 640) expect(Math.abs(size.width - size.allowanceWidth), label).toBeLessThanOrEqual(1);
          expect(size.height, label).toBe(size.allowanceHeight);
          expect(size.height, label).toBeGreaterThanOrEqual(44);
          expect(size.left, label).toBeGreaterThanOrEqual(0);
          expect(size.right, label).toBeLessThanOrEqual(width);
          expect(size.type, label).toBe("date");
        }
      }
    }
  }
  await page.locator("#impugnedDate").focus();
  await expect(page.locator("#impugnedDate")).toBeFocused();
});
