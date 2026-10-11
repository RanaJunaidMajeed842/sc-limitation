import { test } from "node:test";
import assert from "node:assert/strict";
import { calculate, validateInput, type CalculationInput } from "./calculator";
import { createReport } from "./pdf";
const input: CalculationInput = { reference: "Example", impugnedDate: "2026-01-01", filingDate: "2026-02-10", copyApplyDate: "2026-01-05", copyGettingDate: "2026-01-15", givenCopyTime: 30, publicHolidays: 2 };
test("preserves original formula and breakdown", () => {
  const result = calculate(input);
  assert.equal(result.copyDaysConsumed, 10);
  assert.equal(result.rawFilingDays, 40);
  assert.equal(result.totalCopyTime, 40);
  assert.equal(result.totalTimeConsumed, 38);
  assert.equal(result.remainingDays, 2);
});
test("handles exact allowance and exceeded allowance", () => {
  assert.equal(calculate({ ...input, publicHolidays: 0 }).remainingDays, 0);
  assert.equal(calculate({ ...input, filingDate: "2026-02-15", publicHolidays: 0 }).remainingDays, -5);
});
test("counts leap days and DST boundaries as calendar days", () => {
  const result = calculate({ ...input, impugnedDate: "2024-02-28", filingDate: "2024-03-11", copyApplyDate: "2024-03-09", copyGettingDate: "2024-03-11", publicHolidays: 0 });
  assert.equal(result.rawFilingDays, 12);
  assert.equal(result.copyDaysConsumed, 2);
});
test("rejects impossible and incomplete dates", () => {
  assert.ok(validateInput({ ...input, impugnedDate: "2026-02-30" }).impugnedDate);
  assert.ok(validateInput({ ...input, filingDate: "" }).filingDate);
});
test("rejects inconsistent timelines", () => {
  assert.ok(validateInput({ ...input, filingDate: "2025-12-31" }).filingDate);
  assert.ok(validateInput({ ...input, copyApplyDate: "2025-12-31" }).copyApplyDate);
  assert.ok(validateInput({ ...input, copyGettingDate: "2026-01-03" }).copyGettingDate);
  assert.ok(validateInput({ ...input, copyGettingDate: "2026-02-11" }).copyGettingDate);
});
test("rejects invalid allowances and excessive holiday deductions", () => {
  for (const value of [-1, 1.5, NaN, Infinity, 100001]) assert.ok(validateInput({ ...input, givenCopyTime: value }).givenCopyTime);
  assert.ok(validateInput({ ...input, publicHolidays: 41 }).publicHolidays);
});
test("exports a PDF file containing the timeline, breakdown and result", async () => {
  const file = createReport(calculate(input));
  assert.equal(file.type, "application/pdf");
  assert.equal(file.name, "limitation-report-2026-02-10.pdf");
  const content = await file.text();
  assert.ok(content.startsWith("%PDF-"));
  for (const label of ["LIMITATION PERIOD", "Case reference: Example", "Impugned order", "Copy applied for", "Public holidays excluded", "Remaining limitation", "DAYS REMAINING", "30 + 10 - 40 + 2 = 2 days"]) assert.ok(content.includes(label), `Missing ${label}`);
  assert.equal((content.match(/\/Type \/Page\b/g) || []).length, 1);
});
test("ticket stays on one narrow page with long references and large or exceeded results", async () => {
  for (const settings of [{ givenCopyTime: 100000 }, { givenCopyTime: 0 }, { publicHolidays: 0 }]) {
    const result = calculate({ ...input, ...settings, reference: "A long case reference with party names and case identifiers ".repeat(2) });
    const content = await createReport(result).text();
    assert.equal((content.match(/\/Type \/Page\b/g) || []).length, 1);
    const box = content.match(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/);
    assert.ok(box);
    assert.ok(Math.abs(Number(box[1]) / (72 / 25.4) - 105) < 0.01);
    assert.ok(Number(box[2]) / (72 / 25.4) < 220);
    assert.ok(content.includes(result.remainingDays < 0 ? "DAYS OVER ALLOWANCE" : "DAYS REMAINING"));
  }
});
