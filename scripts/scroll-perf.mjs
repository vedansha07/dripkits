// Frame timing while wheel-scrolling the home page with the live jersey running: the stutter test.
// usage: node scripts/scroll-perf.mjs [desktop|mobile] [seconds]
// Prints average fps, the share of slow frames and the worst frame. Needs the dev server on :3000
// (production numbers are better: run against `pnpm build && pnpm start`).

import { chromium, devices } from "@playwright/test";

const [mode = "desktop", seconds = "10"] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const ctx = await browser.newContext(mode === "mobile" ? { ...devices["Pixel 7"], hasTouch: false, isMobile: false } : { viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("pageerror:", e.message));
const BASE = process.env.BASE ?? "http://localhost:3000";
await page.goto(`${BASE}/`, { waitUntil: "load" });
await page.waitForSelector("html[data-stage=live]", { timeout: 30000 });
await page.waitForTimeout(5000);

await page.evaluate(() => {
  const w = window;
  w.__frames = [];
  let last = performance.now();
  const loop = (t) => { w.__frames.push(t - last); last = t; if (!w.__stop) requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
});
await page.mouse.move(720, 450);
const end = Date.now() + Number(seconds) * 1000;
while (Date.now() < end) {
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(45);
}
await page.waitForTimeout(800);
const frames = await page.evaluate(() => { window.__stop = true; return window.__frames.slice(5); });
const y = await page.evaluate(() => Math.round(window.scrollY));
await browser.close();

const sum = frames.reduce((a, b) => a + b, 0);
const slow = (ms) => ((frames.filter((f) => f > ms).length / frames.length) * 100).toFixed(1);
const sorted = [...frames].sort((a, b) => a - b);
console.log(`${mode}: ${frames.length} frames over ${(sum / 1000).toFixed(1)} s, scrolled to y=${y}`);
console.log(`avg ${(1000 / (sum / frames.length)).toFixed(1)} fps, p95 ${sorted[Math.floor(frames.length * 0.95)].toFixed(1)} ms, worst ${sorted.at(-1).toFixed(1)} ms`);
console.log(`frames over 20 ms: ${slow(20)}%, over 33 ms: ${slow(33)}%`);
