// Editorial summaries based on the user-supplied memorandum of 13 October 2026.
// Reported rule periods and case citations retain the memorandum's verification caveats.
export const legalSections = [
  { id: "framework", title: "Applicable law" },
  { id: "periods", title: "Filing periods" },
  { id: "act", title: "Statutory provisions" },
  { id: "computation", title: "Computing time" },
  { id: "delay", title: "Condonation of delay" },
  { id: "verify", title: "Before filing" },
  { id: "sources", title: "Sources & citations" },
] as const;

export const filingPeriods = [
  { title: "Civil petition for leave to appeal", period: "60 days", reference: "Article 185(3) · Order XIII, SCR", detail: "Period stated in the memorandum; confirm the applicable order in the gazetted Rules." },
  { title: "Direct civil appeal", period: "60 days", reference: "Article 185(2)(d), (e)", detail: "Reported 2025 period; previously 30 days." },
  { title: "Criminal appeal", period: "60 days", reference: "Article 185(2)(a), (b), (c)", detail: "Reported 2025 period; previously 30 days." },
  { title: "Criminal petition for leave to appeal", period: "60 days", reference: "Reports on SCR 2025", detail: "Reported 2025 period; previously 30 days." },
  { title: "Leave against a Service Tribunal order", period: "60 days", reference: "Article 212(3) · 2012 SCMR 181", detail: "Court FAQ and cited authority; check the relevant decision." },
  { title: "Review of a Supreme Court judgment or order", period: "30 days", reference: "From pronouncement · Reports on SCR 2025", detail: "Confirm the commencement date and review requirements." },
  { title: "Appeal against the Registrar’s order on objections", period: "14 days", reference: "Reports on SCR 2025", detail: "Verify the applicable rule and the event from which time runs." },
  { title: "Respondent’s objections in an intra-court appeal", period: "30 days", reference: "From service · Summary of SCR 2025", detail: "Confirm jurisdiction and the continued applicability of the procedure." },
  { title: "Security for costs after civil leave is granted", period: "30 days", reference: "Report on SCR 2025", detail: "The memorandum reports rescission of leave on default unless the Court orders otherwise." },
  { title: "Jail petition for leave to appeal", period: "Unconfirmed", reference: "1980 Rules: Order XXIII, rule 3", detail: "The old period was 30 days. The memorandum does not confirm the 2025 period." },
];

export const statutoryProvisions = [
  { section: "Section 3", title: "Filing outside the prescribed period", text: "Subject to applicable statutory exceptions, a late suit, appeal or application is liable to dismissal even if limitation is not raised as a defence." },
  { section: "Section 4", title: "Court closed on the last day", text: "If the deadline falls on a day when the court is closed, presentation may be made when the court reopens. This is not a blanket deduction of every public holiday." },
  { section: "Section 5", title: "Sufficient cause for delay", text: "Where applicable, the court may admit a delayed appeal or specified application on sufficient cause. Condonation is discretionary; the provision does not extend limitation for suits." },
  { section: "Section 12(1)", title: "Exclude the starting day", text: "The day from which the limitation period is reckoned is excluded." },
  { section: "Section 12(2)", title: "Pronouncement and certified-copy time", text: "For appeals, leave applications and review, exclude the day of pronouncement and the time requisite for obtaining the relevant decree, sentence or order." },
  { section: "Section 12(3)", title: "Copy of the underlying judgment", text: "Where a decree is appealed or reviewed, the requisite time for obtaining a copy of the judgment on which it is founded is also excluded." },
  { section: "Section 14", title: "Proceedings before a wrong forum", text: "The memorandum discusses exclusion for proceedings pursued with due diligence and good faith before a court unable to entertain them for want of jurisdiction. Verify statutory scope for the particular proceeding." },
  { section: "Section 29(2)", title: "Special-law limitation", text: "A special or local law may prescribe a different period. The memorandum identifies section 3 and, unless excluded, sections 4, 9–18 and 22; section 5 is not listed. Check the special enactment and the Act together." },
];

export const computationSteps = [
  { title: "Identify pronouncement", text: "Start with the date of the impugned judgment or order, rather than automatically starting from receipt of its copy." },
  { title: "Exclude the starting day", text: "Apply section 12(1) and, where relevant, section 12(2) to the day of pronouncement." },
  { title: "Establish the requisite copy period", text: "Check the copy application and copy-ready dates. Keep the record showing when the certified copy was applied for and made ready." },
  { title: "Apply the prescribed period", text: "Select the period for the particular proceeding and applicable Rules, including any special-law provision." },
  { title: "Check the final day", text: "Apply section 4 if the court is closed on that day. The memorandum notes that Supreme Court vacations alone do not extend time where the Registry remains open." },
  { title: "Confirm filing", text: "Check the actual electronic filing date and current Registry requirements against the computed period." },
];

export const delayAuthorities = [
  { principle: "Apply for condonation and explain each day’s delay.", citation: "1999 SCMR 2353", name: "Muslim Commercial Bank" },
  { principle: "Limitation is substantive; expiry may confer an accrued right on the opposite party.", citation: "2006 SCMR 631", name: "Muhammad Ahmad Ameen" },
  { principle: "An accrued limitation right is not displaced without sufficient cause.", citation: "2006 SCMR 1248", name: "Government of Pakistan v. Malbrow Builders" },
  { principle: "Government litigants must explain delay just as private litigants must.", citation: "1990 SCMR 1059 · 2001 SCMR 722", name: "WAPDA v. M.A. Rahid (as cited in the memorandum)" },
  { principle: "Distinguish section 14’s due diligence and good faith from section 5’s sufficient cause and judicial discretion.", citation: "2012 SCMR 377 · 2023 SCMR 1665", name: "Hydrocarbon Development; later authority" },
  { principle: "The memorandum reports that wrong-forum time was not condoned under section 5 in this authority; verify its facts and scope.", citation: "1999 SCMR 1892", name: "Karamatullah" },
  { principle: "Condonation is not a right; alleging that an order is void does not itself remove limitation.", citation: "2026 SCLR 48", name: "Sindh Irrigation and Drainage Authority v. Province of Sindh" },
  { principle: "A Tribunal leave petition is stated to have a 60-day period.", citation: "2012 SCMR 181", name: "Tribunal petition authority" },
  { principle: "Leave to appeal is discretionary; the digest entry’s bearing on limitation is unconfirmed.", citation: "2012 SCMR 51", name: "Province of Punjab v. Baz Khan" },
];

export const legalSources = [
  { group: "Official texts", links: [
    { title: "Limitation Act, 1908 — Pakistan Code", url: "https://pakistancode.gov.pk/pdffiles/administrator3294e35255f255ea96b3356091fb4844.pdf", note: "Official statutory text; added as a primary reference." },
    { title: "Supreme Court Rules, 1980 — amended to 17 May 2025", url: "https://www.supremecourt.gov.pk/downloads_judgements/all_downloads/Supreme_Court_Rules/SUPREME_COURT_RULES_1980_AMMENDED_17052025.pdf", note: "Legacy rules; applicability must be checked." },
    { title: "Pakistan Supreme Court Rules — SCP copy", url: "https://scp.gov.pk/files/Misc/The_Pakistan_Supreme_Court_Rules.pdf", note: "Link supplied in the memorandum; check edition and access." },
    { title: "Supreme Court — frequently asked questions", url: "https://www.supremecourt.gov.pk/frequently-asked-questions/", note: "Some periods may reflect the 1980 Rules." },
  ] },
  { group: "Reports on the 2025 Rules", links: [
    { title: "The News — modernisation and procedural clarity", url: "https://www.thenews.com.pk/latest/1335898-2025-rules-step-towards-modernisation-procedural-clarity-sc", note: "Secondary report." },
    { title: "Business Recorder — Supreme Court Rules", url: "https://www.brecorder.com/news/40377647", note: "Secondary report." },
    { title: "Daily Times — new 2025 Rules", url: "https://dailytimes.com.pk/1352416/supreme-court-issues-new-2025-rules/", note: "Secondary report." },
    { title: "Khalid Zafar & Associates — Rules 2025", url: "https://khalidzafar.com/laws-of-pakistan/supreme-court-rules-2025/", note: "Legal summary." },
  ] },
  { group: "Annotations & case references", links: [
    { title: "Limitation Act — section 12 annotations", url: "https://pakistanlawyer.com/limitation-act-1908/", note: "Secondary annotations." },
    { title: "Punjab Prosecution — limitation digest", url: "https://pg.punjab.gov.pk/limitation", note: "Digest entries; verify the reported decisions." },
    { title: "Punjab Judicial Academy — Article 185 digest", url: "https://pja.gov.pk/constitution", note: "Digest reference." },
    { title: "2023 SCLR 18 / 2023 SCMR 1665", url: "https://pakistankanoon.com/supreme-court-law-review/sclr-september-2023/2023-sclr-18/", note: "Secondary case report." },
    { title: "2026 SCLR 48", url: "https://pakistankanoon.com/sclr2026.php/2026-SCLR-48/", note: "Secondary case report." },
    { title: "Supreme Court — C.P. 174-Q of 2021", url: "https://www.supremecourt.gov.pk/downloads_judgements/c.p._174_q_2021.pdf", note: "Judgment link supplied in the memorandum." },
  ] },
  { group: "Further verification", links: [
    { title: "Federal Constitutional Court Rules, 2026 — summary", url: "https://pakera.pk/federal-constitutional-court-rules-2026-appeal-review-time-limits/", note: "Secondary summary; verify the official text and jurisdiction." },
  ] },
];
