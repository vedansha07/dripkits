import { Suspense } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero/hero";
import { MostWanted, MostWantedSkeleton } from "@/components/home/most-wanted";
import { FeaturedRail, FeaturedRailSkeleton } from "@/components/home/featured-rail";
import { CrestMarquee } from "@/components/home/crest-marquee";
import { PlayerTiles } from "@/components/home/player-tiles";
import { FanPhotos } from "@/components/home/fan-photos";
import { SiteFooter } from "@/components/site-footer";

// Seven zones, six layout families: split hero, table, rail, marquee, asymmetric tiles, grid, footer.
export default function Home() {
  return (
    <>
      <SiteHeader overlay />
      <main>
        <Hero />

        <section id="table" className="scroll-mt-20 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="type-display mb-8 text-4xl md:text-6xl">Most wanted</h2>
            <Suspense fallback={<MostWantedSkeleton />}>
              <MostWanted />
            </Suspense>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-8 flex items-baseline justify-between">
              <h2 className="type-display text-4xl md:text-6xl">26/27 drops</h2>
              <Link href="/shop/26-27" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">View all</Link>
            </div>
            <Suspense fallback={<FeaturedRailSkeleton />}>
              <FeaturedRail />
            </Suspense>
          </div>
        </section>

        <Suspense fallback={null}>
          <CrestMarquee />
        </Suspense>

        <Suspense fallback={null}>
          <PlayerTiles />
        </Suspense>

        <FanPhotos />
      </main>
      <SiteFooter />
    </>
  );
}
