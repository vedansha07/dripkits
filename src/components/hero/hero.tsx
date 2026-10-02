// The hero: a jersey sewn into existence as you scroll. Frames are pre-rendered in Remotion
// (remotion/scenes/HeroBuild.tsx) and scrubbed by ScrollSequence. The copy follows the frames
// in three steps: the flat pieces, the sewing, the finished shirt. The CTA never moves.

import Link from "next/link";
import manifest from "../../../public/sequences/hero/manifest.json";
import { ScrollSequence } from "@/components/sequence/scroll-sequence";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <ScrollSequence
      manifest={manifest}
      scrollVh={230}
      steps={[0.3, 0.74]}
      posterAlt="A football shirt in blue and garnet stripes, its four pattern pieces laid flat"
      className="bg-brand text-brand-foreground"
      boxClassName="hero-box"
      boxBack={
        <div aria-hidden="true" className="hero-numerals type-display">
          26/27
        </div>
      }
      front={<HeroCopy />}
    />
  );
}

function HeroCopy() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="mx-auto flex h-full max-w-7xl flex-col justify-between px-4 pb-8 pt-24 lg:justify-center lg:pb-0 lg:pt-0">
        <div className="hero-steps relative max-w-[30rem] lg:max-w-[32rem]">
          <div className="hero-step hero-step-0">
            <h1 className="type-display text-5xl sm:text-6xl xl:text-7xl">The kits everyone wants. Before they exist.</h1>
            <p className="mt-5 max-w-[36ch] text-base/relaxed font-medium opacity-80 md:text-lg/relaxed">
              Buy what is in stock. Claim your size on what is not.
            </p>
          </div>
          <div className="hero-step hero-step-1" aria-hidden="true">
            <p className="type-display text-5xl sm:text-6xl xl:text-7xl">Enough claims. We cut the run.</p>
            <p className="mt-5 max-w-[36ch] text-base/relaxed font-medium opacity-80 md:text-lg/relaxed">
              Every kit on the table is made once its sizes are spoken for.
            </p>
          </div>
          <div className="hero-step hero-step-2" aria-hidden="true">
            <p className="type-display text-5xl sm:text-6xl xl:text-7xl">Stitched. Numbered. Yours.</p>
            <p className="mt-5 max-w-[36ch] text-base/relaxed font-medium opacity-80 md:text-lg/relaxed">
              Fan cut, sublimated print, shipped from India.
            </p>
          </div>
        </div>
        <div className="pointer-events-auto mt-8 flex flex-wrap gap-3 lg:mt-10">
          <Button asChild size="lg"><Link href="/shop/26-27">Shop 26/27</Link></Button>
          <Button asChild size="lg" variant="outline" className="border-brand-foreground/30 bg-transparent hover:bg-brand-foreground/5">
            <Link href="#table">See the table</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
