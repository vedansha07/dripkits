import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { MostWanted, type WantedKit } from "@/components/home/most-wanted";
import { KitRoom, type RoomKit } from "@/components/home/kit-room";
import { CrestMarquee } from "@/components/home/crest-marquee";
import { Players, type PlayerKit } from "@/components/home/players";
import { HomeMotion } from "@/components/home/home-motion";
import { StageLoader } from "@/components/stage/stage-loader";
import { HERO_KIT } from "@/lib/kit-palette";
import { earliestDrop, productStatus, totalInterest } from "@/lib/product";
import { getCatalogue, getPlayerKits } from "@/lib/queries";

// One live jersey travels the page: it sews itself together in the hero, turns while claiming is
// explained, reprints as each most-wanted kit, stands beside the table wearing whatever you point
// at, leaves for the players, and comes back to rest over the footer.
// Layout families: product-over-type hero, pinned split, pinned stage, sticky split grid,
// marquee, asymmetric row, wordmark footer.

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

export default async function Home() {
  const [catalogue, playerRows] = await Promise.all([getCatalogue(), getPlayerKits(4)]);

  const items = catalogue.map((p) => ({
    p,
    status: productStatus(p.variants),
    interest: totalInterest(p.variants),
    drop: earliestDrop(p.variants),
    front: p.media.find((m) => m.kind === "front")?.url ?? p.media[0]?.url ?? null,
    back: p.media.find((m) => m.kind === "back")?.url ?? null,
  }));

  const hero = items.find((i) => i.p.slug === HERO_KIT)?.p ?? items[0]?.p ?? null;

  const wanted: WantedKit[] = items
    .filter((i) => i.status === "interested" || i.status === "upcoming")
    .sort((a, b) => b.interest - a.interest)
    .slice(0, 4)
    .map((i) => ({
      slug: i.p.slug,
      name: i.p.name,
      club: i.p.club.name,
      clubShort: i.p.club.shortName,
      pricePaise: i.p.pricePaise,
      interest: i.interest,
      drop: i.drop,
      sizes: [...i.p.variants]
        .sort((a, b) => SIZE_ORDER.indexOf(a.size.code) - SIZE_ORDER.indexOf(b.size.code))
        .map((v) => ({ code: v.size.code, n: v.interestCount })),
    }));

  // buyable first, then by claims: the table reads like a league table of demand
  const rank = { in_stock: 0, upcoming: 1, interested: 2, out_of_stock: 3 } as const;
  const room: RoomKit[] = [...items]
    .sort((a, b) => rank[a.status] - rank[b.status] || b.interest - a.interest)
    .map((i) => ({
      slug: i.p.slug,
      name: i.p.name,
      club: i.p.club.name,
      clubColor: i.p.club.primaryColor,
      pricePaise: i.p.pricePaise,
      compareAtPaise: i.p.compareAtPaise,
      status: i.status,
      interest: i.interest,
      drop: i.drop,
      front: i.front,
      back: i.back,
    }));

  const players: PlayerKit[] = playerRows.map((pl) => {
    const kit = pl.productPlayers[0]?.product;
    return {
      slug: pl.slug,
      name: pl.name,
      club: pl.club?.name ?? "",
      clubColor: pl.club?.primaryColor ?? "#888888",
      kitSlug: kit?.slug ?? null,
      kitName: kit?.name ?? null,
      back: kit?.media.find((m) => m.kind === "back")?.url ?? null,
    };
  });

  const top = wanted[0] ? { name: wanted[0].name, interest: wanted[0].interest } : null;

  return (
    <>
      <SiteHeader />
      <StageLoader />
      <main>
        <Hero kit={hero ? { slug: hero.slug, name: hero.name, pricePaise: hero.pricePaise } : null} />
        <HowItWorks top={top} />
        <MostWanted kits={wanted} />
        <KitRoom kits={room} />
        <CrestMarquee />
        <Players players={players} />
      </main>
      <SiteFooter stage />
      <HomeMotion />
    </>
  );
}
