// Paints every kit's texture atlas for the site's live jersey: public/kits/<slug>.webp at 2048 px
// (public/kits/1024/<slug>.webp for phones), plus public/kits/knit.webp, the bump tile. Painted at
// 4096 and downsampled for clean edges.
// Run: pnpm kits:render [slug ...]

import { mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { DESIGNS } from "../../remotion/jersey/designs";

const only = process.argv.slice(2);
const slugs = [...Object.keys(DESIGNS).filter((s) => s !== "hero"), "knit"].filter((s) => only.length === 0 || only.includes(s));

const outPng = path.resolve(".remotion-out/kits");
const outWeb = path.resolve("public/kits");
mkdirSync(outPng, { recursive: true });
mkdirSync(path.join(outWeb, "1024"), { recursive: true });

const t0 = performance.now();
const serveUrl = await bundle({ entryPoint: path.resolve("remotion/index.ts"), publicDir: path.resolve("remotion/public") });
const chromiumOptions = { gl: "angle" as const };
const browser = await openBrowser("chrome", { chromiumOptions });

for (const design of slugs) {
  const inputProps = { design };
  const composition = await selectComposition({ serveUrl, id: "KitAtlas", inputProps, puppeteerInstance: browser, chromiumOptions });
  const png = path.join(outPng, `${design}.png`);
  await renderStill({ composition, serveUrl, output: png, inputProps, puppeteerInstance: browser, imageFormat: "png", chromiumOptions, overwrite: true });
  const img = sharp(png);
  const info = await (design === "knit" ? img.webp({ quality: 92 }) : img.resize(2048, 2048, { kernel: "lanczos3" }).webp({ quality: 86, effort: 5 }))
    .toFile(path.join(outWeb, `${design}.webp`));
  if (design !== "knit") await sharp(png).resize(1024, 1024, { kernel: "lanczos3" }).webp({ quality: 86, effort: 5 }).toFile(path.join(outWeb, "1024", `${design}.webp`));
  console.log(`${design.padEnd(28)} ${(info.size / 1e3).toFixed(0)} KB`);
}
await browser.close({ silent: true });
console.log(`painted ${slugs.length} atlases in ${((performance.now() - t0) / 1000).toFixed(0)} s`);
