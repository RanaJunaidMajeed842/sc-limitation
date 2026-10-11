import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Limitation — Supreme Court Calculator",
    short_name: "Limitation",
    description: "Free limitation calculations and shareable PDF tickets for legal practitioners.",
    lang: "en",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f8f5",
    theme_color: "#174e40",
    prefer_related_applications: false,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    categories: ["productivity", "utilities"],
  };
}
