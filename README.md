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

The original HTML is preserved as a reference. The current rules are implemented in `lib/calculator.ts`:

```
application delay = copy application date - order date (elapsed days)
if application delay > given copy time: counted copy time = 0
otherwise if copy application date = order date:
  counted copy time = copy received date - copy application date
otherwise:
  counted copy time = copy received date - copy application date + 1
total copy time = given copy time + counted copy time
net filing time = filing date - order date - public holidays
remaining limitation = total copy time - net filing time
```

Date arithmetic uses UTC calendar days to avoid daylight saving offsets. Inputs are validated for valid dates, chronological order and nonnegative whole-day allowances. Given copy time is required explicitly (0 is allowed); public holidays default to 0. The practitioner supplies eligible exclusions. The app does not determine court rules or automatically fetch holidays.

Eligible copy periods include both the application and receipt dates, except that the first day is excluded when application and order dates coincide. An application exactly at the entered elapsed-day cutoff remains eligible: with an order on 1 Jan 2026 and a 60-day allowance, 2 Mar qualifies and 3 Mar receives zero copy time. The cutoff uses the entered allowance directly, without holiday or copy-duration extensions. A late application only sets the added copy time to zero; it does not erase the original given allowance. Same-day and late-application adjustments are explained in the result, PDF ticket and WhatsApp summary.

## PDF and sharing

PDFs are generated locally with jsPDF as a single compact ticket, 105 mm wide, with the limitation result displayed prominently at the top. The ticket contains all entered dates, the case reference, allowances, calculation breakdown, formula, result and credits. Its height adjusts to wrapped text so long references stay on one page. Report generation is lazy-loaded. No case data is stored or sent to a server.

On supported mobile browsers, **Share PDF** uses the Web Share API to pass the PDF file to WhatsApp, email or another selected app. Web Share requires HTTPS in production (localhost is allowed during development), device support and browser permission. Browsers without file sharing download the PDF so users can attach it manually. **Send summary on WhatsApp** opens WhatsApp with a full text summary; it cannot attach a PDF via a URL. Case details are sent to the selected service only when the user chooses to share them.

The theme preference alone is saved in local storage. Changing a calculation input clears the previous result.

## UI

Editable shadcn/ui components are in `components/ui`; `components.json` configures the shadcn CLI. The interface supports light/dark themes, native mobile date pickers, keyboard navigation, accessible share dialogs, inline errors and reduced motion.

Deploy as a standard Next.js application on any compatible host. No environment variables, database or paid service is required.

## Install on Android and iOS

The calculator is an installable Progressive Web App. Deploy it to an **HTTPS** URL, visit it online, and wait for **Ready for offline use**. Users can then install it:

- **Android:** Tap **Install app**, then **Install on this device** if offered. Alternatively, use Chrome's menu → **Install app** or **Add to Home screen**.
- **iPhone / iPad:** Open the URL in Safari, tap the browser's **Share** button → **Add to Home Screen** → **Add**.

The home-screen icon opens the app in its own window. iOS uses the browser's installation menu rather than a programmable install prompt. In-app browsers such as WhatsApp may require opening the link in Safari or Chrome first. These are browser-installed apps; app-store listings and APK/IPA packaging are separate distribution options.

### Offline behavior and updates

`npm run build` generates Android, maskable and Apple PNG icons, builds Next.js, then generates `public/sw.js` with the current build's asset list. The worker caches the calculator page and **all** production JS/CSS chunks, including lazy-loaded PDF code. Calculation and first-time PDF export work after an offline restart once setup completes. WhatsApp and sending reports through online services still need connectivity. Only app assets are cached; case inputs remain in memory and clear when the app reloads.

The worker registers only in production, to avoid caching development code. To test locally:

```sh
npm run build
npm start
```

`http://localhost:3000` supports service workers on the development computer. A phone visiting an HTTP LAN address does **not** qualify: use a deployed HTTPS URL or a trusted HTTPS development setup. Serve the entire app at the domain root; manifest and worker scope use `/`.

New builds generate a new cache version. **Update available** lets users choose when to reload, with a reminder that current inputs will clear. Updates never force a reload mid-calculation. Browser storage can be cleared or evicted; reconnect online if offline assets are removed. `/sw.js` is served with `Cache-Control: no-store`; retain these response headers on your host.

### Browser verification

After building, run:

```sh
npm run test:pwa
```

The tests use locally installed Chrome, launch a production server on port 3100 and verify icons/metadata, offline reload and PDF download, mobile width, iOS installation guidance, and install-prompt handling. Set `PLAYWRIGHT_CHANNEL=msedge` to use Edge. Install the additional WebKit test browser with `npx playwright install webkit`, or run only Chrome with `npm run test:pwa -- --project=chromium`. Date layout tests cover empty/populated fields, both themes, and widths of 320, 375, 390 and 768 pixels in Chromium and WebKit. Windows WebKit falls back to text inputs for dates; these checks do not reproduce the native iOS date picker. Actual home-screen installation, date-picker sizing and OS share sheets should also be checked on physical Android/iOS devices after HTTPS deployment.

The date-input CSS resets native appearance, enforces a full-width border box and keeps Safari's internal date value left-aligned. The inputs remain `type="date"`, so iOS and Android retain their native date pickers. After redeploying a CSS change, reopen the installed PWA while online and accept **Update available** to refresh cached app assets.
