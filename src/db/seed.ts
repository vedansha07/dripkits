// Dev seed. Product imagery is rendered dummy kits (public/products, pnpm products:render);
// player photos are picsum placeholders; crests are null, so the Crest component renders
// initials on the club colour. All replaced by his real assets. Run: pnpm db:seed

import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as s from "./schema";

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(sql, { schema: s });

const img = (seed: string, w = 900, h = 1200) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

type Mode =
  | { kind: "in_stock"; qty: Record<string, number> }
  | { kind: "interested"; total: number }
  | { kind: "upcoming"; date: string; total: number }
  | { kind: "out_of_stock" };

// Interest splits by size, roughly how fan-version sales skew in India.
const SIZE_WEIGHT: Record<string, number> = { XS: 0.04, S: 0.16, M: 0.32, L: 0.28, XL: 0.14, XXL: 0.06 };

function splitInterest(total: number, code: string, i: number) {
  // deterministic, slightly uneven so the numbers look organic rather than computed
  const base = Math.round(total * SIZE_WEIGHT[code]);
  return Math.max(0, base + ((i * 7) % 5) - 2);
}

const PRODUCTS: Array<{
  slug: string;
  name: string;
  club: string;
  season: string;
  kit: string;
  category: string;
  price: number;
  compareAt?: number;
  players?: string[];
  featured?: boolean;
  mode: Mode;
}> = [
  { slug: "real-madrid-home-26-27", name: "Real Madrid Home 26/27", club: "real-madrid", season: "26-27", kit: "home", category: "26-27", price: 199900, featured: true,
    mode: { kind: "in_stock", qty: { XS: 0, S: 4, M: 12, L: 8, XL: 5, XXL: 0 } } },
  { slug: "barcelona-home-26-27", name: "FC Barcelona Home 26/27", club: "barcelona", season: "26-27", kit: "home", category: "26-27", price: 199900, featured: true,
    mode: { kind: "in_stock", qty: { XS: 2, S: 6, M: 9, L: 11, XL: 3, XXL: 1 } } },
  { slug: "man-city-home-26-27", name: "Manchester City Home 26/27", club: "man-city", season: "26-27", kit: "home", category: "26-27", price: 189900, players: ["haaland"], featured: true,
    mode: { kind: "interested", total: 1203 } },
  { slug: "arsenal-away-26-27", name: "Arsenal Away 26/27", club: "arsenal", season: "26-27", kit: "away", category: "26-27", price: 189900,
    mode: { kind: "upcoming", date: "2026-10-14", total: 412 } },
  { slug: "inter-miami-home-26-27", name: "Inter Miami Home 26/27", club: "inter-miami", season: "26-27", kit: "home", category: "26-27", price: 209900, players: ["messi"], featured: true,
    mode: { kind: "interested", total: 2841 } },
  { slug: "al-nassr-home-26-27", name: "Al Nassr Home 26/27", club: "al-nassr", season: "26-27", kit: "home", category: "26-27", price: 189900, players: ["ronaldo"],
    mode: { kind: "interested", total: 1976 } },
  { slug: "real-madrid-away-26-27", name: "Real Madrid Away 26/27", club: "real-madrid", season: "26-27", kit: "away", category: "26-27", price: 199900, players: ["mbappe"],
    mode: { kind: "in_stock", qty: { XS: 0, S: 3, M: 7, L: 6, XL: 4, XXL: 2 } } },
  { slug: "man-city-third-26-27", name: "Manchester City Third 26/27", club: "man-city", season: "26-27", kit: "third", category: "26-27", price: 189900,
    mode: { kind: "interested", total: 287 } },
  { slug: "psg-home-26-27", name: "Paris Saint-Germain Home 26/27", club: "psg", season: "26-27", kit: "home", category: "26-27", price: 199900,
    mode: { kind: "upcoming", date: "2026-10-28", total: 96 } },
  { slug: "liverpool-home-26-27", name: "Liverpool Home 26/27", club: "liverpool", season: "26-27", kit: "home", category: "26-27", price: 189900,
    mode: { kind: "in_stock", qty: { XS: 1, S: 2, M: 0, L: 5, XL: 2, XXL: 0 } } },
  { slug: "argentina-home-26", name: "Argentina Home 26", club: "argentina", season: "26-27", kit: "home", category: "26-27", price: 219900, players: ["messi"],
    mode: { kind: "interested", total: 1534 } },
  { slug: "portugal-home-26", name: "Portugal Home 26", club: "portugal", season: "26-27", kit: "home", category: "26-27", price: 219900, players: ["ronaldo"],
    mode: { kind: "interested", total: 1129 } },
  { slug: "barcelona-away-25-26-fan", name: "FC Barcelona Away 25/26", club: "barcelona", season: "25-26", kit: "away", category: "fan-version", price: 149900, compareAt: 189900,
    mode: { kind: "in_stock", qty: { XS: 3, S: 8, M: 14, L: 10, XL: 6, XXL: 2 } } },
  { slug: "real-madrid-home-25-26-fan", name: "Real Madrid Home 25/26", club: "real-madrid", season: "25-26", kit: "home", category: "fan-version", price: 149900, compareAt: 189900,
    mode: { kind: "out_of_stock" } },
];

async function main() {
  await sql`TRUNCATE interest_requests, notify_requests, wishlists, variants, product_players, product_media, products, players, clubs, sizes, seasons, kit_types, categories, profiles RESTART IDENTITY CASCADE`;

  const cats = await db.insert(s.categories).values([
    { slug: "26-27", name: "26/27", description: "This season's kits.", sort: 0 },
    { slug: "fan-version", name: "Fan Version", description: "Last season and earlier, fan cut.", sort: 1 },
  ]).returning();

  const kits = await db.insert(s.kitTypes).values([
    { slug: "home", name: "Home", sort: 0 }, { slug: "away", name: "Away", sort: 1 },
    { slug: "third", name: "Third", sort: 2 }, { slug: "goalkeeper", name: "Goalkeeper", sort: 3 },
  ]).returning();

  const seasons = await db.insert(s.seasons).values([
    { slug: "26-27", label: "26/27", sort: 0 }, { slug: "25-26", label: "25/26", sort: 1 },
  ]).returning();

  const sizes = await db.insert(s.sizes).values(
    ["XS", "S", "M", "L", "XL", "XXL"].map((code, i) => ({ code, label: code, sort: i })),
  ).returning();

  const clubs = await db.insert(s.clubs).values([
    { slug: "real-madrid", name: "Real Madrid", shortName: "RMA", primaryColor: "#00529F", secondaryColor: "#FEBE10", country: "Spain", sort: 0 },
    { slug: "barcelona", name: "FC Barcelona", shortName: "BAR", primaryColor: "#A50044", secondaryColor: "#004D98", country: "Spain", sort: 1 },
    { slug: "man-city", name: "Manchester City", shortName: "MCI", primaryColor: "#6CABDD", secondaryColor: "#1C2C5B", country: "England", sort: 2 },
    { slug: "arsenal", name: "Arsenal", shortName: "ARS", primaryColor: "#EF0107", secondaryColor: "#023474", country: "England", sort: 3 },
    { slug: "liverpool", name: "Liverpool", shortName: "LIV", primaryColor: "#C8102E", secondaryColor: "#00B2A9", country: "England", sort: 4 },
    { slug: "psg", name: "Paris Saint-Germain", shortName: "PSG", primaryColor: "#004170", secondaryColor: "#DA291C", country: "France", sort: 5 },
    { slug: "inter-miami", name: "Inter Miami", shortName: "MIA", primaryColor: "#F7B5CD", secondaryColor: "#231F20", country: "USA", sort: 6 },
    { slug: "al-nassr", name: "Al Nassr", shortName: "NAS", primaryColor: "#FFE400", secondaryColor: "#1D4290", country: "Saudi Arabia", sort: 7 },
    { slug: "argentina", name: "Argentina", shortName: "ARG", kind: "national", primaryColor: "#75AADB", secondaryColor: "#FFFFFF", country: "Argentina", sort: 8 },
    { slug: "portugal", name: "Portugal", shortName: "POR", kind: "national", primaryColor: "#E42518", secondaryColor: "#046A38", country: "Portugal", sort: 9 },
  ]).returning();

  const byClub = Object.fromEntries(clubs.map((c) => [c.slug, c]));
  const players = await db.insert(s.players).values([
    { slug: "messi", name: "Lionel Messi", imageUrl: img("player-messi", 600, 800), clubId: byClub["inter-miami"].id, sort: 0 },
    { slug: "ronaldo", name: "Cristiano Ronaldo", imageUrl: img("player-ronaldo", 600, 800), clubId: byClub["al-nassr"].id, sort: 1 },
    { slug: "mbappe", name: "Kylian Mbappé", imageUrl: img("player-mbappe", 600, 800), clubId: byClub["real-madrid"].id, sort: 2 },
    { slug: "haaland", name: "Erling Haaland", imageUrl: img("player-haaland", 600, 800), clubId: byClub["man-city"].id, sort: 3 },
  ]).returning();

  const id = <T extends { slug: string; id: string }>(rows: T[], slug: string) => {
    const r = rows.find((x) => x.slug === slug);
    if (!r) throw new Error(`seed: no row with slug ${slug}`);
    return r.id;
  };

  for (const p of PRODUCTS) {
    const [prod] = await db.insert(s.products).values({
      slug: p.slug, name: p.name, pricePaise: p.price, compareAtPaise: p.compareAt, featured: p.featured ?? false,
      categoryId: id(cats, p.category), clubId: id(clubs, p.club), seasonId: id(seasons, p.season), kitTypeId: id(kits, p.kit),
      description: `Fan version of the ${p.name} kit. Sublimated print, breathable knit, regular fit.`,
      fabric: "100% recycled polyester, 160 gsm", fitNotes: "Regular fit. Size up for a looser drape.", care: "Machine wash cold, inside out. Do not iron the print.",
    }).returning();

    await db.insert(s.productMedia).values([
      // rendered catalogue shots (pnpm products:render), dummy kits until his real photography
      { productId: prod.id, url: `/products/${p.slug}-front.webp`, alt: `${p.name}, front`, kind: "front", sort: 0 },
      { productId: prod.id, url: `/products/${p.slug}-back.webp`, alt: `${p.name}, back with name and number`, kind: "back", sort: 1 },
      { productId: prod.id, url: `/products/${p.slug}-detail.webp`, alt: `${p.name}, collar and badge detail`, kind: "detail", sort: 2 },
    ]);

    if (p.players?.length) {
      await db.insert(s.productPlayers).values(p.players.map((slug) => ({ productId: prod.id, playerId: id(players, slug) })));
    }

    await db.insert(s.variants).values(sizes.map((sz, i) => {
      const m = p.mode;
      if (m.kind === "in_stock") {
        const qty = m.qty[sz.code] ?? 0;
        return { productId: prod.id, sizeId: sz.id, status: qty > 0 ? "in_stock" as const : "out_of_stock" as const, stockQty: qty };
      }
      if (m.kind === "interested") return { productId: prod.id, sizeId: sz.id, status: "interested" as const, interestCount: splitInterest(m.total, sz.code, i) };
      if (m.kind === "upcoming") return { productId: prod.id, sizeId: sz.id, status: "upcoming" as const, interestCount: splitInterest(m.total, sz.code, i), expectedDate: m.date };
      return { productId: prod.id, sizeId: sz.id, status: "out_of_stock" as const };
    }));
  }

  const [{ count }] = await sql<{ count: string }[]>`SELECT count(*)::text FROM variants`;
  console.log(`seeded ${PRODUCTS.length} products, ${count} variants, ${clubs.length} clubs, ${players.length} players`);
}

main().then(() => sql.end()).catch((e) => { console.error(e); sql.end(); process.exit(1); });
