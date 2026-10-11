import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(entry => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? collect(target) : target;
  }));
  return files.flat();
}
const assets = (await collect(".next/static"))
  .filter(file => /\.(js|css|woff2?)$/.test(file))
  .map(file => `/_next/static/${path.relative(".next/static", file).split(path.sep).join("/")}`)
  .sort();
const buildId = (await readFile(".next/BUILD_ID", "utf8")).trim();
const template = await readFile("scripts/service-worker.js", "utf8");
const version = createHash("sha256").update(buildId + template).digest("hex").slice(0, 16);
const precache = ["/", "/manifest.webmanifest", "/icon.svg", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/icon-maskable-512.png", "/icons/apple-touch-icon.png", ...assets];
await mkdir("public", { recursive: true });
await writeFile("public/sw.js", template.replace("__CACHE_VERSION__", version).replace("__PRECACHE_ASSETS__", JSON.stringify(precache)));
console.log(`PWA: prepared ${precache.length} offline assets, including lazy PDF chunks (${version}).`);
