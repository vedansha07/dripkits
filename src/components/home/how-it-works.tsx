import Link from "next/link";
import Image from "next/image";
import { formatCount } from "@/lib/format";

// How claiming works, told while the jersey turns on the left. The section is tall and its inner
// frame sticks, so scroll moves through the three steps (home-motion sets which one is on).

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export function HowItWorks({ top }: { top: { name: string; interest: number } | null }) {
  const steps = [
    {
      title: "Claim your size.",
      body: "Not in stock? Tap Interested on the size you wear. It is free, and you only pay if you buy when it lands.",
      extra: (
        <ul className="mt-7 flex flex-wrap gap-2" aria-label="Sizes">
          {SIZES.map((s) => (
            <li
              key={s}
              data-size={s}
              className={
                s === "M"
                  ? "type-num rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
                  : "type-num glass rounded-full px-4 py-2 text-sm"
              }
            >
              {s}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: "We count every claim.",
      body: top ? `Every kit shows its claims, size by size. Right now the most wanted is ${top.name}.` : "Every kit shows its claims, size by size.",
      extra: top ? (
        <p className="mt-6 flex items-end gap-3">
          <span className="type-count text-[clamp(4.5rem,11vw,9rem)]" data-count={top.interest}>
            {formatCount(top.interest)}
          </span>
          <span className="mb-3 text-sm text-muted-foreground">claims and counting</span>
        </p>
      ) : null,
    },
    {
      title: "Enough claims, we make the run.",
      body: "When a kit has enough claims we restock it and tell everyone who claimed, before anyone else can buy.",
      extra: (
        <Link href="#wanted" className="mt-7 inline-flex h-12 items-center rounded-full bg-primary px-6 text-[15px] font-medium text-primary-foreground">
          See what is close
        </Link>
      ),
    },
  ];

  return (
    <section id="how" className="scroll-stage relative h-[320svh]" aria-label="How claiming works">
      <div className="scroll-stage-inner sticky top-0 h-[100svh] overflow-hidden">
        <Image
          src="/products/barcelona-home-26-27-back.webp"
          alt=""
          width={720}
          height={960}
          className="stage-fallback absolute left-1/2 top-[30%] z-[1] w-[min(60vw,34svh)] -translate-x-1/2 -translate-y-1/2 lg:left-[28%] lg:top-1/2 lg:w-[min(34vw,64svh)]"
        />
        <div className="relative z-[3] mx-auto grid h-full max-w-[1400px] grid-cols-1 px-4 sm:px-8 lg:grid-cols-2">
          <div aria-hidden="true" className="hidden lg:block" />
          <div className="flex flex-col justify-end pb-10 lg:justify-center lg:pb-0 lg:pl-8">
            <ol className="mb-8 flex gap-2" aria-hidden="true">
              {steps.map((_, i) => (
                <li key={i} data-how-tick={i} className="h-1.5 w-10 rounded-full bg-foreground/15 transition-colors duration-300 data-[on=true]:bg-foreground" data-on={i === 0} />
              ))}
            </ol>
            <div className="how-steps">
              {steps.map((s, i) => (
                <article key={s.title} className="how-step" data-how-step={i} data-state={i === 0 ? "on" : "off"}>
                  <h2 className="type-head text-[clamp(2.3rem,5vw,4.4rem)]">{s.title}</h2>
                  <p className="mt-4 max-w-md text-base text-foreground/75 sm:text-lg">{s.body}</p>
                  {s.extra}
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
