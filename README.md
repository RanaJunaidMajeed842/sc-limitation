# Limitation calculator

A mobile-friendly Next.js App Router conversion of `sc-limitation-calculator.html`, using TypeScript, Tailwind CSS and shadcn/ui components with Radix primitives.

## Run locally

Requires Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:3000.

```sh
npm test
npm run typecheck
npm run build
npm start
```

## Customize credits

Edit `lib/site-config.ts` to replace the builder placeholder and optionally add a website and contact email. The builder credit also appears in exported PDFs.

## Calculations

The original HTML is preserved. Its formula is preserved in `lib/calculator.ts`:

```
copy duration = copy received date - copy application date
total copy time = given copy time + copy duration
net filing time = filing date - order date - public holidays
remaining limitation = total copy time - net filing time
```

Date arithmetic uses UTC calendar days to avoid daylight saving offsets. Inputs are validated for valid dates, chronological order and nonnegative whole-day allowances. Given copy time is required explicitly (0 is allowed); public holidays default to 0. The practitioner supplies eligible exclusions. The app does not determine court rules or automatically fetch holidays.

## PDF and sharing

PDFs are generated locally with jsPDF as a single compact ticket, 105 mm wide, with the limitation result displayed prominently at the top. The ticket contains all entered dates, the case reference, allowances, calculation breakdown, formula, result and credits. Its height adjusts to wrapped text so long references stay on one page. Report generation is lazy-loaded. No case data is stored or sent to a server.

On supported mobile browsers, **Share PDF** uses the Web Share API to pass the PDF file to WhatsApp, email or another selected app. Web Share requires HTTPS in production (localhost is allowed during development), device support and browser permission. Browsers without file sharing download the PDF so users can attach it manually. **Send summary on WhatsApp** opens WhatsApp with a full text summary; it cannot attach a PDF via a URL. Case details are sent to the selected service only when the user chooses to share them.

The theme preference alone is saved in local storage. Changing a calculation input clears the previous result.

## UI

Editable shadcn/ui components are in `components/ui`; `components.json` configures the shadcn CLI. The interface supports light/dark themes, native mobile date pickers, keyboard navigation, accessible share dialogs, inline errors and reduced motion.

Deploy as a standard Next.js application on any compatible host. No environment variables, database or paid service is required.
