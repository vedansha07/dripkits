import { expect, test } from "@playwright/test";

test("home renders the hero and real rows from the database", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("header").getByRole("link", { name: "dripkits, home" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("The kits everyone wants");
  await expect(page.getByRole("img", { name: /pattern pieces laid flat/i })).toBeVisible();
  const rows = page.locator("#table ol li");
  await rows.first().scrollIntoViewIfNeeded();
  await expect(rows.first()).toBeVisible();
  expect(await rows.count()).toBeGreaterThan(0);
});

test("scrolling the hero paints frames and moves through the copy steps", async ({ page }) => {
  await page.goto("/");
  const stage = page.locator(".seq-stage");
  const canvas = stage.locator("canvas");
  await expect(stage).toHaveAttribute("data-step", "0");
  await expect(canvas).toHaveCSS("opacity", "1", { timeout: 15_000 }); // first frame decoded and drawn
  const travel = await page.evaluate(() => {
    const s = document.querySelector<HTMLElement>(".seq-section")!;
    return s.offsetHeight - window.innerHeight;
  });
  for (let y = 0; y <= travel; y += Math.ceil(travel / 12)) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate((v) => window.scrollTo(0, v), travel);
  await expect(stage).toHaveAttribute("data-step", "2", { timeout: 5_000 });
  const p = await stage.evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue("--p")));
  expect(p).toBeGreaterThan(0.95);
});

test("reduced motion gets the finished shirt, no pinning", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator(".seq-stage")).toHaveAttribute("data-step", "2");
  const tall = await page.evaluate(() => document.querySelector<HTMLElement>(".seq-section")!.offsetHeight / window.innerHeight);
  expect(tall).toBeLessThan(1.05);
  await ctx.close();
});

test("design page shows the wordmark variants on both grounds", async ({ page }) => {
  await page.goto("/design");
  await expect(page.getByRole("heading", { name: /wordmark, three variants/i })).toBeVisible();
  await expect(page.getByText("DRIPKITS", { exact: true })).toHaveCount(2);
  await expect(page.getByText("on the yellow field")).toBeVisible();
  await expect(page.getByText("on white")).toBeVisible();
});
