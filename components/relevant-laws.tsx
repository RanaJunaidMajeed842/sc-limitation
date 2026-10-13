"use client";

import { BookOpen, ExternalLink, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { computationSteps, delayAuthorities, filingPeriods, legalSections, legalSources, statutoryProvisions } from "@/lib/legal-reference";

function ReadingSection({ id, number, title, children }: { id: string; number: string; title: string; children: React.ReactNode }) {
  return <section aria-labelledby={`laws-${id}`} className="border-b pb-8 last:border-0 sm:pb-10">
    <p className="mb-2 text-xs font-semibold uppercase tracking-[.15em] text-primary-text">{number} / Legal reference</p>
    <h3 id={`laws-${id}`} tabIndex={-1} className="display-heading mb-5 scroll-mt-6 text-2xl leading-tight outline-none sm:text-3xl">{title}</h3>
    {children}
  </section>;
}

export function RelevantLaws() {
  function jump(id: string) {
    const heading = document.getElementById(`laws-${id}`);
    heading?.scrollIntoView({ block: "start", behavior: "instant" });
    heading?.focus({ preventScroll: true });
  }

  return <Dialog><DialogTrigger asChild><Button variant="outline"><BookOpen /> Relevant laws</Button></DialogTrigger>
    <DialogContent className="flex h-[90dvh] max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_1rem)] max-w-5xl flex-col overflow-hidden p-0 sm:w-[calc(100%_-_3rem)]">
      <header className="shrink-0 border-b px-5 pb-5 pt-6 sm:px-8 sm:pt-7">
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-primary-text"><BookOpen className="size-4" /> Practitioner reference</p>
        <DialogTitle className="display-heading pr-8 text-3xl leading-tight sm:text-4xl">Relevant laws</DialogTitle>
        <DialogDescription className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Limitation for filings before the Supreme Court of Pakistan. Structured from the supplied memorandum dated 13 October 2026.</DialogDescription>
      </header>
      <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[190px_minmax(0,1fr)]">
        <nav aria-label="Legal reference contents" className="shrink-0 overflow-x-auto border-b bg-muted/30 p-2 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-4">
          <p className="mb-3 hidden px-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground lg:block">On this page</p>
          <div className="flex w-max gap-1 lg:w-auto lg:flex-col">{legalSections.map(({ id, title }, index) => <button key={id} onClick={() => jump(id)} className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:text-sm"><span className="text-primary-text">{String(index + 1).padStart(2, "0")}</span>{title}</button>)}</div>
        </nav>
        <div data-laws-reader className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-2xl space-y-8 text-sm leading-7 sm:space-y-10 sm:text-[15px]">
            <aside className="flex items-start gap-3 rounded-xl border bg-muted/40 p-4 text-xs leading-6 text-muted-foreground sm:text-sm"><Info className="mt-1 size-4 shrink-0 text-primary-text" /><div><p className="mb-1 font-semibold text-foreground">Source status</p><p>The memorandum did not review the official 2025 Rules. Filing periods below are reported figures, and case citations come from secondary sources. Confirm the gazetted Rules, applicable edition and reported judgments before relying on them.</p></div></aside>

            <ReadingSection id="framework" number="01" title="Applicable law">
              <p className="mb-5 text-muted-foreground">The reference brings together the Limitation Act, 1908 (Act IX of 1908), the Supreme Court Rules and authorities on exclusion of time and condonation of delay.</p>
              <dl className="divide-y rounded-xl border px-4 sm:px-5">
                <div className="py-4"><dt className="font-semibold">Limitation Act, 1908</dt><dd className="mt-1 text-muted-foreground">The statutory framework for computation, exclusions and extension of time where applicable.</dd></div>
                <div className="py-4"><dt className="font-semibold">Supreme Court Rules, 2025</dt><dd className="mt-1 text-muted-foreground">The memorandum reports Rules framed under Article 191, replacing the 1980 Rules from 6 August 2025, while pending proceedings continue under the earlier Rules. Verify the transitional provision.</dd></div>
                <div className="py-4"><dt className="font-semibold">Connection between the Rules and the Act</dt><dd className="mt-1 text-muted-foreground">Order I, rule 4 of the 1980 Rules links day-based periods to computation under the Act. The memorandum does not confirm the corresponding 2025 provision.</dd></div>
                <div className="py-4"><dt className="font-semibold">Filing procedure</dt><dd className="mt-1 text-muted-foreground">The memorandum describes electronic filing with scanned documents and non-acceptance of postal filings. Confirm the current Registry procedure.</dd></div>
              </dl>
            </ReadingSection>

            <ReadingSection id="periods" number="02" title="Filing periods at a glance">
              <p className="mb-5 text-muted-foreground">Reported periods from the memorandum, presented as a reference rather than verified 2025 rule text.</p>
              <div className="grid gap-3 sm:grid-cols-2">{filingPeriods.map(item => <article key={item.title} className="rounded-xl border p-4"><p className="mb-3 inline-block rounded-md bg-muted px-2.5 py-1 text-base font-semibold text-primary-text">{item.period}</p><h4 className="text-sm font-semibold leading-6">{item.title}</h4><p className="mt-2 text-xs leading-5 text-muted-foreground">{item.reference}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{item.detail}</p></article>)}</div>
              <p className="mt-5 rounded-lg bg-muted/40 p-4 text-xs leading-6 text-muted-foreground"><strong className="text-foreground">Legacy FAQ figures:</strong> the memorandum identifies 30-day figures for criminal and jail petitions in the Court’s FAQ as reflecting the 1980 Rules. Do not treat those figures as confirmation of the 2025 position.</p>
            </ReadingSection>

            <ReadingSection id="act" number="03" title="The Limitation Act, 1908">
              <p className="mb-5 text-muted-foreground">Plain-language summaries of the provisions highlighted in the memorandum. Read each section in its statutory context.</p>
              <div className="space-y-5">{statutoryProvisions.map(item => <article key={item.section} className="border-l-2 border-primary/50 pl-4"><p className="text-xs font-semibold uppercase tracking-wider text-primary-text">{item.section}</p><h4 className="mt-1 font-semibold">{item.title}</h4><p className="mt-2 text-muted-foreground">{item.text}</p></article>)}</div>
              <p className="mt-6 rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground"><strong className="text-foreground">Exclusion and condonation are different.</strong> The memorandum treats qualifying copy-time exclusion under section 12 as a statutory entitlement, while relief under section 5 depends on sufficient cause and the Court’s discretion.</p>
            </ReadingSection>

            <ReadingSection id="computation" number="04" title="Computing the period">
              <ol className="space-y-5">{computationSteps.map((step, index) => <li key={step.title} className="flex gap-4"><span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{index + 1}</span><div><h4 className="font-semibold">{step.title}</h4><p className="mt-1 text-muted-foreground">{step.text}</p></div></li>)}</ol>
              <aside className="mt-6 rounded-xl border p-4 text-xs leading-6 text-muted-foreground"><p className="font-semibold text-foreground">Reading this alongside the calculator</p><p className="mt-1">The certified-copy receipt date may differ from the copy-ready date. A total entered as “public holidays” does not itself establish a statutory exclusion; section 4 concerns closure on the final day. Establish eligible dates and exclusions from the case record and applicable law.</p></aside>
            </ReadingSection>

            <ReadingSection id="delay" number="05" title="Condonation of delay">
              <p className="mb-5 text-muted-foreground">The memorandum emphasises a supported application, an explanation for the delay and the distinction between statutory exclusion and discretionary extension.</p>
              <p className="mb-5 text-xs font-medium text-primary-text">The following principles and citations are supplied references; verify the law reports and case context.</p>
              <div className="space-y-4">{delayAuthorities.map(item => <article key={item.citation} className="rounded-xl border p-4"><h4 className="text-sm font-semibold leading-6">{item.principle}</h4><p className="mt-2 text-xs font-semibold text-primary-text">{item.citation}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{item.name}</p></article>)}</div>
              <p className="mt-5 text-muted-foreground">For criminal and jail matters, the memorandum reports digest entries allowing delay in some long-sentence and capital cases, and refusing relief in some acquittal matters. Those entries provide no case numbers and should not be treated as independently verified authorities.</p>
            </ReadingSection>

            <ReadingSection id="verify" number="06" title="Before filing">
              <ul className="space-y-5">
                <li><h4 className="font-semibold">Confirm the forum and jurisdiction</h4><p className="mt-1 text-muted-foreground">The memorandum flags changes following the Twenty-seventh Amendment of 13 November 2025, including reported transfer of Article 184 jurisdiction to the Federal Constitutional Court under Article 175E(3). Verify the constitutional text and the correct forum before selecting a limitation period.</p></li>
                <li><h4 className="font-semibold">Check the relevant court’s Rules</h4><p className="mt-1 text-muted-foreground">The memorandum reports 60 days for leave petitions and 30 days for review under Federal Constitutional Court Rules, 2026. These are separate, unverified references; do not automatically apply Supreme Court periods to another forum.</p></li>
                <li><h4 className="font-semibold">Identify any special statute</h4><p className="mt-1 text-muted-foreground">Check whether a special enactment supplies the period or restricts available exclusions or extension. The memorandum gives Federal Shariat Court appeals as an example requiring separate review.</p></li>
                <li><h4 className="font-semibold">Check review deposits and costs</h4><p className="mt-1 text-muted-foreground">The memorandum reports increased review security and possible costs for frivolous review, reported up to Rs 25,000. The deposit amount is unconfirmed; verify the operative provision.</p></li>
              </ul>
            </ReadingSection>

            <ReadingSection id="sources" number="07" title="Sources & citations">
              <p className="mb-5 text-muted-foreground">Reading links from the memorandum, with an official Pakistan Code copy of the Act added. External sources require an internet connection; links are not confirmation of their current contents.</p>
              <div className="space-y-6">{legalSources.map(group => <div key={group.group}><h4 className="mb-3 text-sm font-semibold">{group.group}</h4><ul className="space-y-3">{group.links.map(link => <li key={link.url}><a href={link.url} target="_blank" rel="noopener noreferrer" className="group flex min-h-11 items-start gap-2 rounded-lg border p-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><FileText className="mt-1 size-4 shrink-0 text-primary-text" /><span className="min-w-0 flex-1"><span className="block text-xs font-medium leading-6 sm:text-sm">{link.title}</span><span className="block text-xs leading-5 text-muted-foreground">{link.note} Opens in a new tab.</span></span><ExternalLink className="mt-1 size-3.5 shrink-0 text-muted-foreground" /></a></li>)}</ul></div>)}</div>
              <p className="mt-6 text-xs leading-6 text-muted-foreground">Editorial basis: “Memorandum on limitation for filings before the Supreme Court of Pakistan”, supplied by the project owner, dated 13 October 2026. Statutory summaries and reported case principles are presented in paraphrase.</p>
            </ReadingSection>
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => jump("framework")}>Back to the beginning</Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}
