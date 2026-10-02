// Viewport screenshots at fractions of a scroll-sequence section, to check frame and copy sync.
// Usage: node scripts/scroll-shot.mjs <outPrefix> <desktop|mobile> <f1,f2,...>
//   f = fraction of the pinned travel (0 = top of the hero, 1 = its last frame); f > 1 scrolls past it.
import { chromium, devices } from "@playwright/test";

const [prefix, form = "desktop", list = "0,0.5,1"] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext(form === "mobile" ? devices["Pixel 7"] : { viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("[pageerror]", e.message.slice(0, 300)));
page.on("console", (m) => { if (m.type() === "error") console.log("[console]", m.text().slice(0, 300)); });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const travel = await page.evaluate(() => {
  const s = document.querySelector(".seq-section");
  return s ? s.offsetHeight - window.innerHeight : 0;
});
let at = 0;
for (const f of list.split(",").map(Number)) {
  const target = Math.round(f * travel);
  // walk there in steps so the scrubbed timeline and the loader keep up
  const step = Math.sign(target - at) * Math.max(80, Math.abs(target - at) / 12);
  while (Math.abs(target - at) > Math.abs(step)) { at += step; await page.evaluate((v) => window.scrollTo(0, v), at); await page.waitForTimeout(40); }
  at = target;
  await page.evaluate((v) => window.scrollTo(0, v), at);
  await page.waitForTimeout(1300);
  const step_ = await page.evaluate(() => document.querySelector(".seq-stage")?.getAttribute("data-step"));
  const file = `${prefix}-${form}-${String(f).replace(".", "_")}.png`;
  await page.screenshot({ path: file });
  console.log("wrote", file, "step", step_);
}
await browser.close();
