import { jsPDF } from "jspdf";
import {
  calculationNote,
  formatDate,
  resultRows,
  type CalculationResult,
} from "./calculator";
import { siteConfig } from "./site-config";

export function createReport(result: CalculationResult): File {
  const late = result.remainingDays < 0;
  const width = 105;
  const margin = 9;
  const contentWidth = width - margin * 2;
  const accent: [number, number, number] = late ? [153, 48, 31] : [100, 21, 43];
  const ink: [number, number, number] = [48, 35, 35];
  const muted: [number, number, number] = [117, 102, 94];

  // Measure wrapped content first so even long references stay on one ticket.
  const measure = new jsPDF();
  measure.setFont("helvetica", "bold");
  measure.setFontSize(8.5);
  const reference: string[] = measure.splitTextToSize(
    `Case reference: ${result.reference || "Not provided"}`,
    contentWidth,
  );
  measure.setFont("helvetica", "normal");
  measure.setFontSize(8);
  const formula: string[] = measure.splitTextToSize(
    `${result.givenCopyTime} + ${result.copyDaysConsumed} - ${result.rawFilingDays} + ${result.publicHolidays} = ${result.remainingDays} days`,
    contentWidth - 6,
  );
  measure.setFontSize(6.5);
  const note: string[] = measure.splitTextToSize(calculationNote, contentWidth);
  measure.setFontSize(7);
  const credits: string[] = measure.splitTextToSize(
    `Built by ${siteConfig.builder}`,
    contentWidth,
  );
  const height =
    180 +
    reference.length * 4 +
    formula.length * 3.8 +
    note.length * 3 +
    credits.length * 3.3;
  const doc = new jsPDF({
    unit: "mm",
    format: [width, height],
    orientation: "portrait",
  });
  doc.setProperties({
    title: "Limitation calculation ticket",
    subject: "Case timeline and limitation breakdown",
    creator: "Limitation calculator",
  });
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, "F");
  doc.setDrawColor(223, 212, 200);
  doc.roundedRect(3, 3, width - 6, height - 6, 3, 3, "S");

  // The outcome is the first and largest element, above all case details.
  doc.setFillColor(...accent);
  doc.roundedRect(3, 3, width - 6, 41, 3, 3, "F");
  doc.rect(3, 37, width - 6, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("LIMITATION PERIOD", width / 2, 12, { align: "center" });
  const days = `${Math.abs(result.remainingDays)}`;
  doc.setFontSize(40);
  const numberWidth = doc.getTextWidth(days);
  if (numberWidth > contentWidth)
    doc.setFontSize((40 * contentWidth) / numberWidth);
  doc.text(days, width / 2, 28, { align: "center" });
  doc.setFontSize(10);
  doc.text(late ? "DAYS OVER ALLOWANCE" : "DAYS REMAINING", width / 2, 35, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(
    late
      ? "Outside entered allowance"
      : result.remainingDays === 0
        ? "Entered allowance fully consumed"
        : "Within entered allowance",
    width / 2,
    41,
    { align: "center" },
  );

  doc.setDrawColor(196, 177, 155);
  doc.setLineDashPattern([1, 1.2], 0);
  doc.line(7, 47, width - 7, 47);
  doc.setLineDashPattern([], 0);
  doc.setFillColor(255, 255, 255);
  doc.circle(3, 47, 2, "F");
  doc.circle(width - 3, 47, 2, "F");
  doc.setTextColor(...ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(reference, margin, 54, { lineHeightFactor: 1.334 });
  let y = 54 + reference.length * 4;
  doc.setTextColor(...muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text(`Generated: ${new Date().toLocaleString("en-GB")}`, margin, y);
  y += 8;

  function section(title: string, rows: [string, string][]) {
    doc.setTextColor(...accent);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(title, margin, y);
    y += 6;
    for (const [index, [label, value]] of rows.entries()) {
      const total = label === "Remaining limitation";
      if (total || index % 2 === 0) {
        doc.setFillColor(
          ...((total ? accent : [248, 245, 239]) as [number, number, number]),
        );
        doc.roundedRect(margin - 2, y - 3.8, contentWidth + 4, 5.8, 1, 1, "F");
      }
      doc.setTextColor(
        ...((total ? [255, 255, 255] : ink) as [number, number, number]),
      );
      doc.setFont("helvetica", total ? "bold" : "normal");
      doc.setFontSize(7.5);
      doc.text(label, margin, y);
      doc.setFont("helvetica", "bold");
      doc.text(value, width - margin, y, { align: "right" });
      y += 5.8;
    }
    y += 5;
  }
  section("Case timeline", [
    ["Impugned order", formatDate(result.impugnedDate)],
    ["Filing date", formatDate(result.filingDate)],
    ["Copy applied for", formatDate(result.copyApplyDate)],
    ["Copy received", formatDate(result.copyGettingDate)],
  ]);
  section("Calculation breakdown", resultRows(result));
  doc.setFillColor(248, 245, 239);
  doc.roundedRect(
    margin - 2,
    y - 3,
    contentWidth + 4,
    9 + formula.length * 3.8,
    2,
    2,
    "F",
  );
  doc.setTextColor(...ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Formula", margin + 1, y + 1);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(formula, margin + 1, y, { lineHeightFactor: 1.346 });
  y += formula.length * 3.8 + 8;
  doc.setFontSize(6.5);
  doc.setTextColor(...muted);
  doc.text(note, margin, y, { lineHeightFactor: 1.308 });
  y += note.length * 3 + 5;
  doc.setDrawColor(223, 212, 200);
  doc.line(margin, y - 2, width - margin, y - 2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("Free for legal practitioners", width / 2, y + 2, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.text(credits, width / 2, y + 6, {
    align: "center",
    lineHeightFactor: 1.336,
  });
  return new File(
    [doc.output("arraybuffer")],
    `limitation-report-${result.filingDate}.pdf`,
    { type: "application/pdf" },
  );
}
export function downloadReport(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
