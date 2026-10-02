// Renders catalogue shots for every product design: bundle once, one browser, renderStill per
// shot, then WebP into public/products/<slug>-<view>.webp. Run: pnpm products:render [slug ...]

import { mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { DESIGNS } from "../../remotion/jersey/designs";

const VIEWS = ["front", "back", "detail"] as const;
const only = process.argv.slice(2);
const slugs = Object.keys(DESIGNS).filter((s) => s !== "hero" && (only.length === 0 || only.includes(s)));

const outPng = path.resolve(".remotion-out/products");
const outWeb = path.resolve("public/products");
mkdirSync(outPng, { recursive: true });
mkdirSync(outWeb, { recursive: true });

const t0 = performance.now();
const serveUrl = await bundle({
  entryPoint: path.resolve("remotion/index.ts"),
  publicDir: path.resolve("remotion/public"),
});
const chromiumOptions = { gl: "angle" as const };
const browser = await openBrowser("chrome", { chromiumOptions });

let n = 0;
for (const slug of slugs) {
  for (const view of VIEWS) {
    const inputProps = { design: slug, view };
    const composition = await selectComposition({ serveUrl, id: "ProductShot", inputProps, puppeteerInstance: browser, chromiumOptions });
    const png = path.join(outPng, `${slug}-${view}.png`);
    await renderStill({ composition, serveUrl, output: png, inputProps, puppeteerInstance: browser, imageFormat: "png", chromiumOptions, overwrite: true });
    const info = await sharp(png).resize(view === "detail" ? 900 : 720).webp({ quality: 82, alphaQuality: 90, effort: 5 }).toFile(path.join(outWeb, `${slug}-${view}.webp`));
    n++;
    console.log(`${slug.padEnd(28)} ${view.padEnd(6)} ${(info.size / 1e3).toFixed(0)} KB`);
  }
}
await browser.close({ silent: true });
console.log(`rendered ${n} shots in ${((performance.now() - t0) / 1000).toFixed(0)} s`);
