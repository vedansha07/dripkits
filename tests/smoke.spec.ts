import { expect, test, type Page } from "@playwright/test";

/** Scrolls so a section is the given fraction through its scroll range (sticky sections are tall). */
async function scrollThrough(page: Page, id: string, fraction: number) {
  await page.evaluate(
    ([id, f]) => {
      const el = document.getElementById(id as string)!;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + (el.offsetHeight - window.innerHeight) * (f as number), behavior: "instant" });
    },
    [id, fraction] as const,
  );
}

test("home renders the hero, the sections and the table from the database", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("header").getByRole("link", { name: "dripkits, home" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("You claim it.");
  for (const id of ["how", "wanted", "table", "players", "footer"]) await expect(page.locator(`#${id}`)).toHaveCount(1);
  // a plain scroll: the cards rise in as they enter, which Playwright's own scroll-into-view retries against
  const cards = page.locator("#table li");
  await scrollThrough(page, "table", 0);
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThan(4);
});

test("the live jersey comes up and the scroll drives the sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-stage", "live", { timeout: 30_000 });
  await expect(page.locator(".stage canvas")).toHaveCount(1);

  // how it works: the middle step, and its counter lands on the real claim count
  await scrollThrough(page, "how", 0.5);
  const step = page.locator('[data-how-step="1"]');
  await expect(step).toHaveAttribute("data-state", "on", { timeout: 5_000 });
  const counter = step.locator("[data-count]");
  const target = Number(await counter.getAttribute("data-count"));
  await expect(counter).toHaveText(new Intl.NumberFormat("en-IN").format(target), { timeout: 5_000 });

  // most wanted: the third kit is on, the first has slid past
  await scrollThrough(page, "wanted", 0.6);
  await expect(page.locator('[data-wanted-name="2"]')).toHaveAttribute("data-state", "on", { timeout: 5_000 });
  await expect(page.locator('[data-wanted-name="0"]')).toHaveAttribute("data-state", "past");
  await expect(page.locator('[data-wanted-panel="2"]')).toBeVisible();
});

test("reduced motion gets a static page: no live jersey, stills and every step shown", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator(".stage")).toHaveCount(0);
  await expect(page.locator("#hero img.stage-fallback")).toBeVisible();
  const tall = await page.evaluate(() => document.getElementById("how")!.offsetHeight / window.innerHeight);
  expect(tall).toBeLessThan(2);
  await ctx.close();
});

test("design page shows the wordmark variants on both grounds", async ({ page }) => {
  await page.goto("/design");
  await expect(page.getByRole("heading", { name: /wordmark, three variants/i })).toBeVisible();
  await expect(page.getByText("DRIPKITS", { exact: true })).toHaveCount(2);
  await expect(page.getByText("On a kit atmosphere")).toBeVisible();
  await expect(page.getByText("On white")).toBeVisible();
});
