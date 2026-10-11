import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Limitation — Supreme Court Filing Calculator",
  description: "A free limitation calculation tool for legal practitioners. Calculate, review and share your case timeline as a PDF.",
  applicationName: "Limitation",
  appleWebApp: { capable: true, title: "Limitation", statusBarStyle: "default" },
  icons: { apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }] },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#174e40", viewportFit: "cover" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
