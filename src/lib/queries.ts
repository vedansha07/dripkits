import { cacheLife, cacheTag } from "next/cache";
import { asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db, clubs, productMedia, products, variants } from "@/db";

// Catalogue reads are cached for about a minute and tagged, so admin writes can
// revalidateTag("products") and the Table refreshes without a redeploy.

export type MostWantedRow = {
  id: string;
  slug: string;
  name: string;
  club: string;
  clubShort: string;
  clubColor: string;
  crestUrl: string | null;
  interest: number;
  image: string | null;
};

export async function getMostWanted(limit = 10): Promise<MostWantedRow[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const interest = sql<number>`coalesce(sum(${variants.interestCount}), 0)::int`;
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      club: clubs.name,
      clubShort: clubs.shortName,
      clubColor: clubs.primaryColor,
      crestUrl: clubs.crestUrl,
      interest,
    })
    .from(products)
    .innerJoin(clubs, eq(products.clubId, clubs.id))
    .leftJoin(variants, eq(variants.productId, products.id))
    .where(eq(products.active, true))
    .groupBy(products.id, clubs.id)
    .having(sql`${interest} > 0`)
    .orderBy(desc(interest), asc(products.name))
    .limit(limit);

  if (rows.length === 0) return [];
  const fronts = await db
    .select({ productId: productMedia.productId, url: productMedia.url })
    .from(productMedia)
    .where(inArray(productMedia.productId, rows.map((r) => r.id)))
    .orderBy(asc(productMedia.sort));
  const firstImage = new Map<string, string>();
  for (const m of fronts) if (!firstImage.has(m.productId)) firstImage.set(m.productId, m.url);

  return rows.map((r) => ({ ...r, image: firstImage.get(r.id) ?? null }));
}

export async function getFeaturedProducts(limit = 8) {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  return db.query.products.findMany({
    where: (p, { and, eq }) => and(eq(p.active, true), eq(p.featured, true)),
    orderBy: (p, { desc }) => [desc(p.createdAt)],
    limit,
    with: {
      club: true,
      media: { orderBy: (m, { asc }) => [asc(m.sort)] },
      variants: { with: { size: true }, orderBy: (v, { asc }) => [asc(v.updatedAt)] },
    },
  });
}

export type FeaturedProduct = Awaited<ReturnType<typeof getFeaturedProducts>>[number];

export async function getClubs() {
  "use cache";
  cacheLife("hours");
  cacheTag("clubs");
  return db.query.clubs.findMany({
    where: (c, { eq }) => eq(c.active, true),
    orderBy: (c, { asc }) => [asc(c.sort), asc(c.name)],
  });
}

export async function getPlayers(limit = 4) {
  "use cache";
  cacheLife("hours");
  cacheTag("players");
  return db.query.players.findMany({
    where: (p, { eq }) => eq(p.active, true),
    orderBy: (p, { asc }) => [asc(p.sort)],
    limit,
    with: { club: true },
  });
}
