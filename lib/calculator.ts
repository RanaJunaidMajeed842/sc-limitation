export type CalculationInput = {
  reference: string;
  impugnedDate: string;
  filingDate: string;
  copyApplyDate: string;
  copyGettingDate: string;
  givenCopyTime: number;
  publicHolidays: number;
};
export type CalculationResult = CalculationInput & {
  copyDaysConsumed: number; totalCopyTime: number; rawFilingDays: number;
  totalTimeConsumed: number; remainingDays: number;
  copyApplicationElapsedDays: number;
  copyTimeRule: "inclusive" | "order-day-excluded" | "late-application";
};
export type FieldErrors = Partial<Record<keyof CalculationInput, string>>;
const DAY = 86400000;
function parseDay(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const stamp = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(stamp) || new Date(stamp).toISOString().slice(0, 10) !== value) return null;
  return stamp;
}
export function validateInput(input: CalculationInput): FieldErrors {
  const errors: FieldErrors = {};
  const keys = ["impugnedDate", "filingDate", "copyApplyDate", "copyGettingDate"] as const;
  for (const key of keys) if (parseDay(input[key]) === null) errors[key] = "Enter a valid date.";
  for (const key of ["givenCopyTime", "publicHolidays"] as const) {
    if (!Number.isSafeInteger(input[key]) || input[key] < 0 || input[key] > 100000) errors[key] = "Enter a whole number between 0 and 100,000.";
  }
  if (!errors.impugnedDate && !errors.filingDate && input.filingDate < input.impugnedDate) errors.filingDate = "Filing cannot be before the order.";
  if (!errors.impugnedDate && !errors.copyApplyDate && input.copyApplyDate < input.impugnedDate) errors.copyApplyDate = "Copy application cannot be before the order.";
  if (!errors.copyApplyDate && !errors.copyGettingDate && input.copyGettingDate < input.copyApplyDate) errors.copyGettingDate = "Copy receipt cannot be before the application.";
  if (!errors.copyGettingDate && !errors.filingDate && input.copyGettingDate > input.filingDate) errors.copyGettingDate = "Copy receipt cannot be after filing.";
  if (!errors.impugnedDate && !errors.filingDate && !errors.publicHolidays) {
    const elapsed = (parseDay(input.filingDate)! - parseDay(input.impugnedDate)!) / DAY;
    if (input.publicHolidays > elapsed) errors.publicHolidays = "Holidays cannot exceed the order-to-filing period.";
  }
  return errors;
}
export function calculate(input: CalculationInput): CalculationResult {
  if (Object.keys(validateInput(input)).length) throw new Error("Invalid calculation input");
  const copyApplicationElapsedDays = (parseDay(input.copyApplyDate)! - parseDay(input.impugnedDate)!) / DAY;
  const copyElapsedDays = (parseDay(input.copyGettingDate)! - parseDay(input.copyApplyDate)!) / DAY;
  // The cutoff is elapsed days: an application ON the last allowed day qualifies.
  // A late application takes priority over copy-duration counting.
  const copyTimeRule: CalculationResult["copyTimeRule"] = copyApplicationElapsedDays > input.givenCopyTime
    ? "late-application"
    : copyApplicationElapsedDays === 0 ? "order-day-excluded" : "inclusive";
  const copyDaysConsumed = copyTimeRule === "late-application" ? 0
    : copyElapsedDays + (copyTimeRule === "inclusive" ? 1 : 0);
  const rawFilingDays = (parseDay(input.filingDate)! - parseDay(input.impugnedDate)!) / DAY;
  const totalCopyTime = input.givenCopyTime + copyDaysConsumed;
  const totalTimeConsumed = rawFilingDays - input.publicHolidays;
  return { ...input, copyDaysConsumed, copyApplicationElapsedDays, copyTimeRule, rawFilingDays, totalCopyTime, totalTimeConsumed, remainingDays: totalCopyTime - totalTimeConsumed };
}
export function copyTimeDisclaimer(result: CalculationResult): string | null {
  if (result.copyTimeRule === "late-application") {
    return `Copy time is 0 days because the application was made ${result.copyApplicationElapsedDays} elapsed days after the order, exceeding the entered ${result.givenCopyTime}-day allowance. No copy-time extension is added; the given allowance remains unchanged.`;
  }
  if (result.copyTimeRule === "order-day-excluded") {
    return `The copy application and impugned order share the same date, so that first day is excluded. Counting subsequent days through the copy receipt date gives ${result.copyDaysConsumed} days of copy time.`;
  }
  return null;
}
export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}
export function resultRows(result: CalculationResult): [string, string][] {
  return [
    ["Copy time counted", `${result.copyDaysConsumed} days`],
    ["Given copy time", `${result.givenCopyTime} days`],
    ["Total copy time", `${result.totalCopyTime} days`],
    ["Order-to-filing period", `${result.rawFilingDays} days`],
    ["Public holidays excluded", `${result.publicHolidays} days`],
    ["Net filing time", `${result.totalTimeConsumed} days`],
    ["Remaining limitation", `${result.remainingDays} days`],
  ];
}
export const calculationNote = "Uses the supplied calculator formula. Given copy time and eligible public holidays are entered by the practitioner. Verify the applicable limitation period, exclusions and court rules before filing.";
