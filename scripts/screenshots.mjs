// Full-page screenshots of key routes in both themes, mobile and desktop.
// Usage: node scripts/screenshots.mjs <outDir> [route ...]   (dev server must be running)
// Routes are given WITHOUT a leading slash ("home" for "/", "design", "kits/psg-home-26-27"),
// because Git Bash rewrites a bare "/" argument into the Git install path.
import { chromium, devices } from "@playwright/test";
import { mkdirSync } from "node:fs";

const out = process.argv[2] ?? "./.playwright/shots";
const names = process.argv.length > 3 ? process.argv.slice(3) : ["home", "design"];
const routes = names.map((n) => (n === "home" ? "/" : "/" + n.replace(/^\/+/, "")));
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const targets = [
  ["mobile", devices["Pixel 7"]],
  ["desktop", { viewport: { width: 1440, height: 900 } }],
];

for (const [name, opts] of targets) {
  for (const theme of ["dark", "light"]) {
    const ctx = await browser.newContext(opts);
    await ctx.addInitScript((t) => localStorage.setItem("theme", t), theme);
    const page = await ctx.newPage();
    for (const route of routes) {
      await page.goto("http://localhost:3000" + route, { waitUntil: "networkidle" });
      await page.waitForTimeout(1800); // let fonts, the generated texture and the cloth settle
      // walk the page so enter-on-scroll reveals have fired, then return to the top
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < total; y += 400) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(40); }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(600);
      const slug = route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "-");
      const file = `${out}/${slug}-${name}-${theme}.png`;
      await page.screenshot({ path: file, fullPage: true });
      console.log("wrote", file);
    }
    await ctx.close();
  }
}
await browser.close();
