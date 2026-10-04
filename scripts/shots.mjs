// Screenshots of the home page at points along its scroll, with the live jersey running.
// usage: node scripts/shots.mjs <outPrefix> <desktop|mobile> <section:fraction,...>
//   section is an element id (hero, how, wanted, table, players, footer); fraction is how far
//   through that section's scroll range (0 = its top at the viewport top, 1 = its end).
// Logs page errors. Needs the dev server on :3000.

import { chromium, devices } from "@playwright/test";

const [prefix, mode = "desktop", list = "hero:0"] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const ctx = await browser.newContext(mode === "mobile" ? { ...devices["Pixel 7"] } : { viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("pageerror:", e.message));
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") console.log(`console.${m.type()}:`, m.text().slice(0, 200)); });

const BASE = process.env.BASE ?? "http://localhost:3000";
await page.goto(`${BASE}/`, { waitUntil: "load" });
const live = await page.waitForSelector("html[data-stage=live]", { timeout: 30000 }).then(() => true, () => false);
console.log(`stage live: ${live}`);
// let the sewing intro finish
await page.waitForTimeout(live ? 4800 : 1500);

for (const target of list.split(",")) {
  const [id, f = "0"] = target.split(":");
  const y = await page.evaluate(([id, f]) => {
    const el = document.getElementById(id);
    if (!el) return null;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = Math.max(0, el.offsetHeight - window.innerHeight);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return Math.min(max, top + Number(f) * range);
  }, [id, f]);
  if (y === null) { console.log(`no #${id}`); continue; }
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
  await page.waitForTimeout(1600);
  const file = `${prefix}-${mode}-${id}-${f.replace(".", "_")}.png`;
  await page.screenshot({ path: file });
  console.log(`wrote ${file} at y=${Math.round(y)}`);
}
await browser.close();
