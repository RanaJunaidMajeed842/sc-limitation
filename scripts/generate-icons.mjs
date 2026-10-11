import { mkdir, readFile } from "node:fs/promises";
import sharp from "sharp";

await mkdir("public/icons", { recursive: true });
const svg = await readFile("app/icon.svg", "utf8");
await Promise.all([
  ...[192, 512].map(size => sharp(Buffer.from(svg)).resize(size, size).png().toFile(`public/icons/icon-${size}.png`)),
  sharp(Buffer.from(svg)).resize(180, 180).png().toFile("public/icons/apple-touch-icon.png"),
  sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#64152b"/><svg x="96" y="96" width="320" height="320" viewBox="0 0 64 64">${svg.replace(/<svg[^>]*>|<\/svg>/g, "")}</svg></svg>`))
    .png().toFile("public/icons/icon-maskable-512.png"),
]);
console.log("Generated Android and Apple home-screen icons.");
