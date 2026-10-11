"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileCheck2,
  FileText,
  Heart,
  Loader2,
  MessageCircle,
  Moon,
  RotateCcw,
  Scale,
  Share2,
  ShieldCheck,
  Sun,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  calculate,
  calculationNote,
  formatDate,
  resultRows,
  validateInput,
  type CalculationInput,
  type CalculationResult,
  type FieldErrors,
} from "@/lib/calculator";
import { siteConfig } from "@/lib/site-config";
import { PwaManager } from "@/components/pwa-manager";

type FormValues = Omit<CalculationInput, "givenCopyTime" | "publicHolidays"> & {
  givenCopyTime: string;
  publicHolidays: string;
};
const initial: FormValues = {
  reference: "",
  impugnedDate: "",
  filingDate: "",
  copyApplyDate: "",
  copyGettingDate: "",
  givenCopyTime: "",
  publicHolidays: "0",
};
const dateFields = [
  {
    key: "impugnedDate",
    label: "Impugned order date",
    hint: "When the order was passed",
  },
  {
    key: "filingDate",
    label: "Filing date",
    hint: "Actual or intended date of filing",
  },
  {
    key: "copyApplyDate",
    label: "Copy application date",
    hint: "When the certified copy was requested",
  },
  {
    key: "copyGettingDate",
    label: "Copy received date",
    hint: "When the certified copy was obtained",
  },
] as const;

export function Calculator() {
  const [form, setForm] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [dark, setDark] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [pdfModule, setPdfModule] = useState<typeof import("@/lib/pdf") | null>(
    null,
  );
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let enabled = window.matchMedia("(prefers-color-scheme: dark)").matches;
    try {
      const saved = localStorage.getItem("limitation-theme");
      if (saved) enabled = saved === "dark";
    } catch {}
    setDark(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);
  useEffect(() => {
    if (result && !pdfModule)
      import("@/lib/pdf")
        .then(setPdfModule)
        .catch(() =>
          setNotice("Could not load PDF export. Recalculate to try again."),
        );
  }, [result, pdfModule]);
  function toggleTheme() {
    const enabled = !dark;
    setDark(enabled);
    document.documentElement.classList.toggle("dark", enabled);
    try {
      localStorage.setItem("limitation-theme", enabled ? "dark" : "light");
    } catch {}
  }
  function update(key: keyof FormValues, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setResult(null);
    setNotice("");
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const input: CalculationInput = {
      ...form,
      reference: form.reference.trim(),
      givenCopyTime:
        form.givenCopyTime === "" ? NaN : Number(form.givenCopyTime),
      publicHolidays:
        form.publicHolidays === "" ? 0 : Number(form.publicHolidays),
    };
    const issues = validateInput(input);
    setErrors(issues);
    if (Object.keys(issues).length) {
      document.getElementById(Object.keys(issues)[0])?.focus();
      return;
    }
    setResult(calculate(input));
    setNotice("");
    requestAnimationFrame(() => {
      resultRef.current?.focus({ preventScroll: true });
      if (window.innerWidth < 1024)
        resultRef.current?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
          block: "start",
        });
    });
  }
  async function exportPdf(share: boolean) {
    if (!result || !pdfModule || busy) return;
    setBusy(true);
    setNotice("");
    try {
      const { createReport, downloadReport } = pdfModule;
      const file = createReport(result);
      if (share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Limitation calculation report",
        });
        setNotice("Report shared.");
      } else {
        downloadReport(file);
        setNotice(
          share
            ? "PDF downloaded. Attach it in WhatsApp, email or your preferred app."
            : "PDF downloaded.",
        );
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError"))
        setNotice("Could not export the PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  function whatsapp() {
    if (!result) return;
    const text = [
      "Limitation calculation report",
      result.reference && `Case: ${result.reference}`,
      `Status: ${result.remainingDays < 0 ? "Outside" : "Within"} entered allowance`,
      `Order: ${formatDate(result.impugnedDate)}`,
      `Filing: ${formatDate(result.filingDate)}`,
      `Copy applied: ${formatDate(result.copyApplyDate)}`,
      `Copy received: ${formatDate(result.copyGettingDate)}`,
      ...resultRows(result).map(([label, value]) => `${label}: ${value}`),
      `Formula: ${result.givenCopyTime} + ${result.copyDaysConsumed} - ${result.rawFilingDays} + ${result.publicHolidays} = ${result.remainingDays} days`,
      calculationNote,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }
  const late = !!result && result.remainingDays < 0;

  return (
    <div className="min-h-dvh">
      <a
        href="#calculator"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-card focus:p-4"
      >
        Skip to calculator
      </a>
      <header className="border-b bg-card">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
          <a
            href="#"
            className="flex items-center gap-3"
            aria-label="Limitation home"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Scale className="size-5" />
            </span>
            <span className="text-xl font-semibold tracking-tight">
              Limitation<span className="text-primary-text">.</span>
            </span>
          </a>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-primary-text sm:flex">
              <Heart className="size-3.5" /> Free for the legal community
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={
                dark ? "Switch to light theme" : "Switch to dark theme"
              }
            >
              {dark ? <Sun /> : <Moon />}
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 pb-12 pt-9 sm:px-8 sm:pt-14">
        <div className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Practitioner tools</span>
          <ChevronRight className="size-3" />
          <span className="text-foreground">Limitation calculator</span>
        </div>
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-primary-text">
              <span className="size-1.5 rounded-full bg-primary" /> Supreme
              Court filing assistant
            </p>
            <h1 className="display-heading text-4xl leading-tight sm:text-5xl">
              Every day counts.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              A clearer way to calculate limitation. Enter your case timeline,
              <br className="hidden sm:block" /> review the breakdown, and share
              a report in seconds.
            </p>
          </div>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-primary-text" /> Your case details
            stay in your browser
          </span>
        </div>
        <PwaManager />
        <div
          id="calculator"
          className="grid scroll-mt-5 items-start gap-6 lg:grid-cols-[1.12fr_1fr]"
        >
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="size-5 text-primary-text" /> Case timeline
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  01 / Enter details
                </span>
              </div>
              <CardDescription>
                Have your order and certified copy dates handy.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={submit} noValidate>
                <div className="mb-6 space-y-2">
                  <Label htmlFor="reference">
                    Case reference{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="reference"
                    placeholder="e.g. CPLA 123 / 2026"
                    maxLength={120}
                    value={form.reference}
                    onChange={(e) => update("reference", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Included in your report to keep it easy to identify.
                  </p>
                </div>
                <div className="mb-6 grid gap-x-4 gap-y-5 sm:grid-cols-2">
                  {dateFields.map(({ key, label, hint }) => (
                    <div key={key} className="min-w-0 space-y-2">
                      <Label htmlFor={key}>
                        {label}{" "}
                        <span className="text-primary-text" aria-hidden="true">
                          *
                        </span>
                      </Label>
                      <Input
                        id={key}
                        type="date"
                        required
                        value={form[key]}
                        onChange={(e) => update(key, e.target.value)}
                        aria-invalid={!!errors[key]}
                        aria-describedby={`${key}-hint`}
                      />
                      <p
                        id={`${key}-hint`}
                        className={`text-xs leading-relaxed ${errors[key] ? "text-destructive" : "text-muted-foreground"}`}
                      >
                        {errors[key] || hint}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mb-6 border-t pt-5">
                  <h3 className="mb-4 text-sm font-semibold">
                    Time allowances
                  </h3>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="givenCopyTime">
                        Given copy time (days){" "}
                        <span className="text-primary-text" aria-hidden="true">
                          *
                        </span>
                      </Label>
                      <Input
                        id="givenCopyTime"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        max="100000"
                        step="1"
                        required
                        placeholder="e.g. 30"
                        value={form.givenCopyTime}
                        onChange={(e) =>
                          update("givenCopyTime", e.target.value)
                        }
                        aria-invalid={!!errors.givenCopyTime}
                        aria-describedby="givenCopyTime-hint"
                      />
                      <p
                        id="givenCopyTime-hint"
                        className={`text-xs ${errors.givenCopyTime ? "text-destructive" : "text-muted-foreground"}`}
                      >
                        {errors.givenCopyTime ||
                          "Allowance used in the original formula"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="publicHolidays">
                        Public holidays (days)
                      </Label>
                      <Input
                        id="publicHolidays"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        max="100000"
                        step="1"
                        value={form.publicHolidays}
                        onChange={(e) =>
                          update("publicHolidays", e.target.value)
                        }
                        aria-invalid={!!errors.publicHolidays}
                        aria-describedby="publicHolidays-hint"
                      />
                      <p
                        id="publicHolidays-hint"
                        className={`text-xs ${errors.publicHolidays ? "text-destructive" : "text-muted-foreground"}`}
                      >
                        {errors.publicHolidays ||
                          "Eligible days to exclude; enter 0 if none"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="h-12 flex-1">
                    Calculate limitation <ArrowRight />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-12"
                    aria-label="Reset calculator"
                    onClick={() => {
                      setForm(initial);
                      setErrors({});
                      setResult(null);
                      setNotice("");
                      document.getElementById("impugnedDate")?.focus();
                    }}
                  >
                    <RotateCcw />
                  </Button>
                </div>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Required fields are marked with an asterisk.
                </p>
              </form>
            </CardContent>
          </Card>
          <div className="space-y-5">
            <Card className="overflow-hidden">
              <div
                ref={resultRef}
                tabIndex={-1}
                className="scroll-mt-5 outline-none"
                aria-label="Calculation result"
              >
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileCheck2 className="size-5 text-primary-text" /> Your
                      calculation
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      02 / Review & share
                    </span>
                  </div>
                </CardHeader>
                {!result ? (
                  <div className="dot-grid flex min-h-80 flex-col items-center justify-center px-7 py-10 text-center">
                    <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border bg-card shadow-sm">
                      <Scale className="size-7 text-primary-text" />
                    </div>
                    <h3 className="display-heading text-2xl">
                      Clarity starts with a timeline.
                    </h3>
                    <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
                      Enter your dates to see the limitation status and a
                      transparent, step-by-step calculation.
                    </p>
                    <span className="mt-6 flex items-center gap-2 rounded-full border bg-card px-3 py-2 text-xs text-muted-foreground">
                      <FileText className="size-3.5" /> PDF report ready after
                      calculation
                    </span>
                  </div>
                ) : (
                  <CardContent className="result-enter pt-5">
                    <div
                      className={`rounded-xl border p-5 ${late ? "border-destructive/25 bg-destructive/5" : "border-primary/20 bg-primary/5"}`}
                    >
                      <div
                        className={`mb-3 flex items-center gap-2 text-sm font-semibold ${late ? "text-destructive" : "text-primary-text"}`}
                      >
                        {late ? (
                          <TriangleAlert className="size-4" />
                        ) : (
                          <CheckCircle2 className="size-4" />
                        )}
                        {late
                          ? "Time-Barred"
                          : "Within prescribed limitation time"}
                      </div>
                      <p className="text-4xl font-semibold tracking-tight">
                        {Math.abs(result.remainingDays)}{" "}
                        <span className="text-lg font-normal text-muted-foreground">
                          days {late ? "over" : "remaining"}
                        </span>
                      </p>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        {result.remainingDays === 0
                          ? "The entered allowance is fully consumed on this filing date."
                          : `Based on a filing date of ${formatDate(result.filingDate)}.`}
                      </p>
                    </div>
                    {result.reference && (
                      <p className="mt-4 wrap-break-word text-sm">
                        <span className="text-muted-foreground">Case: </span>
                        {result.reference}
                      </p>
                    )}
                    <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Calculation breakdown
                    </h3>
                    <dl>
                      {resultRows(result).map(([label, value], index) => (
                        <div
                          key={label}
                          className={`flex justify-between gap-4 py-2.5 text-sm ${index === 6 ? "mt-1 border-t font-semibold" : "border-b border-border/60"}`}
                        >
                          <dt
                            className={
                              index === 6 ? "" : "text-muted-foreground"
                            }
                          >
                            {label}
                          </dt>
                          <dd className="shrink-0 font-medium tabular-nums">
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-4 rounded-lg bg-muted p-3 text-xs leading-5 text-muted-foreground">
                      <p className="font-medium text-foreground">
                        How it adds up
                      </p>
                      <p className="mt-1 tabular-nums">
                        {result.givenCopyTime} + {result.copyDaysConsumed} −{" "}
                        {result.rawFilingDays} + {result.publicHolidays} ={" "}
                        <strong className="text-foreground">
                          {result.remainingDays} days
                        </strong>
                      </p>
                      <p>
                        Given copy time + copy duration − filing period +
                        holidays
                      </p>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        disabled={busy || !pdfModule}
                        onClick={() => exportPdf(false)}
                      >
                        {busy ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <ArrowDownToLine />
                        )}{" "}
                        Save PDF
                      </Button>
                      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Share2 /> Share report
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogTitle className="pr-8 text-xl font-semibold">
                            Share your calculation
                          </DialogTitle>
                          <DialogDescription className="mt-2 text-sm leading-6 text-muted-foreground">
                            A clean PDF with your case timeline, every
                            calculation and the final result.
                          </DialogDescription>
                          <div className="mt-5 space-y-3">
                            <Button
                              className="w-full"
                              disabled={busy || !pdfModule}
                              onClick={() => exportPdf(true)}
                            >
                              {busy ? (
                                <Loader2 className="animate-spin" />
                              ) : (
                                <Share2 />
                              )}{" "}
                              Share PDF
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full"
                              disabled={busy || !pdfModule}
                              onClick={() => exportPdf(false)}
                            >
                              <ArrowDownToLine /> Download PDF
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={whatsapp}
                            >
                              <MessageCircle /> Send summary on WhatsApp
                            </Button>
                          </div>
                          <p className="mt-4 text-xs leading-5 text-muted-foreground">
                            On supported phones, Share PDF opens your share
                            sheet, including WhatsApp. Otherwise, download the
                            PDF and attach it in your preferred app. The
                            WhatsApp summary button sends text.
                          </p>
                          <p
                            role="status"
                            className="mt-3 text-sm text-primary-text"
                          >
                            {notice}
                          </p>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                )}
              </div>
            </Card>
            <p
              role="status"
              aria-live="polite"
              className={
                notice
                  ? "flex items-center gap-2 text-sm text-primary-text"
                  : "sr-only"
              }
            >
              {notice && <Check className="size-4 shrink-0" />}
              {notice}
            </p>
            <div className="flex items-start gap-3 rounded-xl border bg-muted/40 p-4">
              <CircleHelp className="mt-0.5 size-4 shrink-0 text-primary-text" />
              <div>
                <h3 className="mb-1 text-sm font-semibold">
                  A calculation aid for practitioners
                </h3>
                <p className="text-xs leading-5 text-muted-foreground">
                  {calculationNote}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-9 grid gap-5 border-t pt-6 sm:grid-cols-3">
          {[
            {
              icon: Clock3,
              title: "Straightforward calculations",
              text: "Calendar-day arithmetic, clearly explained.",
            },
            {
              icon: ShieldCheck,
              title: "Private by design",
              text: "No sign-up. No case details sent to a server.",
            },
            {
              icon: Share2,
              title: "Ready to share",
              text: "Keep or send a complete PDF breakdown.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <Icon className="mt-0.5 size-4 shrink-0 text-primary-text" />
              <div>
                <h3 className="text-xs font-semibold">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-center text-xs text-muted-foreground sm:flex-row sm:px-8">
          <p>Made for the legal community.</p>
          <p>
            Built by{" "}
            {siteConfig.websiteUrl ? (
              <a
                className="underline underline-offset-4"
                href={siteConfig.websiteUrl}
                target="_blank"
                rel="noreferrer"
              >
                {siteConfig.builder}
              </a>
            ) : (
              <span className="text-foreground">{siteConfig.builder}</span>
            )}
            {siteConfig.contactEmail && (
              <>
                {" "}
                ·{" "}
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="underline"
                >
                  Contact
                </a>
              </>
            )}
          </p>
        </div>
      </footer>
    </div>
  );
}
