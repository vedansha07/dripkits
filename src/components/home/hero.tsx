import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";

// The hero: a giant wordmark behind the live jersey (which sews itself together on arrival), the
// promise in front. Entrance motion is CSS, so it plays on first paint without waiting for JS.

export function Hero({ kit }: { kit: { slug: string; name: string; pricePaise: number } | null }) {
  return (
    <section id="hero" className="relative min-h-[100svh] overflow-hidden">
      <p aria-hidden="true" className="hero-word type-giant">
        {["DRIP", "KITS"].map((w, wi) => (
          <span key={w} className="flex">
            {w.split("").map((ch, i) => (
              <span key={i} className="rise inline-block" style={{ "--i": wi * 4 + i } as React.CSSProperties}>
                {ch}
              </span>
            ))}
          </span>
        ))}
      </p>

      {kit ? (
        <Image
          src={`/products/${kit.slug}-front.webp`}
          alt=""
          width={720}
          height={960}
          className="stage-fallback absolute left-1/2 top-[44%] z-[1] w-[min(78vw,46svh)] -translate-x-1/2 -translate-y-1/2 md:left-[68%] md:top-[54%] md:w-[min(42vw,70svh)]"
        />
      ) : null}

      <div className="relative z-[3] mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-end px-4 pb-8 sm:px-8 md:pb-14">
        <div className="max-w-[46rem]">
          <h1 className="type-head text-[clamp(2.5rem,5.6vw,5rem)]">
            <span className="line-mask"><span className="rise" style={{ "--i": 6 } as React.CSSProperties}>You claim it.</span></span>
            <span className="line-mask"><span className="rise" style={{ "--i": 7 } as React.CSSProperties}>We make it.</span></span>
          </h1>
          <p className="rise mt-5 max-w-md text-base text-foreground/75 sm:text-lg" style={{ "--i": 9 } as React.CSSProperties}>
            Football kits for India. Buy what is in stock. Claim your size on the rest, and enough claims gets it made.
          </p>
          <div className="rise mt-7 flex flex-wrap gap-3" style={{ "--i": 10 } as React.CSSProperties}>
            <Button asChild size="lg" className="h-12 px-6 text-[15px]">
              <Link href="#table">Shop the table</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="glass h-12 px-6 text-[15px]">
              <Link href="#how">How claiming works</Link>
            </Button>
          </div>
        </div>

        {kit ? (
          <Link
            href={`/kits/${kit.slug}`}
                prefetch={false}
            className="stage-hint glass rise absolute bottom-14 right-8 hidden items-center gap-4 rounded-full py-2 pl-5 pr-2 text-sm lg:flex"
            style={{ "--i": 12 } as React.CSSProperties}
          >
            <span className="font-medium">{kit.name}</span>
            <span className="type-num text-foreground/70">{formatINR(kit.pricePaise)}</span>
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <ArrowUpRightIcon weight="bold" className="size-4" />
            </span>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
