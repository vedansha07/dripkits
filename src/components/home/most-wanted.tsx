import Image from "next/image";
import Link from "next/link";
import { formatCount, formatDropDate, formatINR } from "@/lib/format";
import { kitColors } from "@/lib/kit-palette";

// The most wanted kits we have not made yet. The frame sticks while scroll walks through them:
// the jersey reprints itself as each one, the club's code fills the wall behind it, and the
// panels show the live claims, size by size. home-motion sets which kit is on.

export type WantedKit = {
  slug: string;
  name: string;
  club: string;
  clubShort: string;
  pricePaise: number;
  interest: number;
  sizes: Array<{ code: string; n: number }>;
  drop: string | null;
};

export function MostWanted({ kits }: { kits: WantedKit[] }) {
  if (kits.length === 0) return null;
  return (
    <section
      id="wanted"
      className="scroll-stage relative"
      style={{ height: `${100 + kits.length * 70}svh` }}
      aria-label="Most wanted"
      data-kits={kits.map((k) => k.slug).join(",")}
    >
      <div className="scroll-stage-inner sticky top-0 h-[100svh] overflow-hidden">
        <div aria-hidden="true" className="absolute inset-x-0 top-[38%] z-[1] -translate-y-1/2 lg:top-1/2">
          <div className="wanted-names type-giant text-center text-[34vw] lg:text-[27vw]">
            {kits.map((k, i) => (
              <span key={k.slug} className="wanted-name" data-wanted-name={i} data-state={i === 0 ? "on" : "next"} style={{ color: kitColors(k.slug)[1] }}>
                {k.clubShort}
              </span>
            ))}
          </div>
        </div>

        {kits.map((k, i) => (
          <Image
            key={k.slug}
            src={`/products/${k.slug}-front.webp`}
            alt=""
            width={720}
            height={960}
            data-wanted-still={i}
            className="stage-fallback absolute left-1/2 top-[38%] z-[1] w-[min(62vw,36svh)] -translate-x-1/2 -translate-y-1/2 data-[off=true]:hidden lg:top-1/2 lg:w-[min(34vw,62svh)]"
            data-off={i !== 0}
          />
        ))}

        <div className="relative z-[3] mx-auto flex h-full max-w-[1400px] flex-col justify-between px-4 pb-6 pt-24 sm:px-8 lg:pb-10">
          <header className="flex items-start justify-between gap-6">
            <div>
              <h2 className="type-head text-[clamp(2rem,4.4vw,3.8rem)]">Most wanted</h2>
              <p className="mt-2 max-w-xs text-sm text-foreground/70 sm:text-base">Kits we have not made yet, ranked by live claims.</p>
            </div>
            <ol className="mt-3 flex gap-1.5" aria-hidden="true">
              {kits.map((k, i) => (
                <li key={k.slug} data-wanted-tick={i} data-on={i === 0} className="h-1.5 w-7 rounded-full bg-foreground/15 transition-colors duration-300 data-[on=true]:bg-foreground" />
              ))}
            </ol>
          </header>

          <div className="grid">
            {kits.map((k, i) => {
              const max = Math.max(1, ...k.sizes.map((s) => s.n));
              return (
                <div
                  key={k.slug}
                  data-wanted-panel={i}
                  data-state={i === 0 ? "on" : "off"}
                  className="wanted-panel col-start-1 row-start-1 grid items-end gap-4 lg:grid-cols-[1fr_auto_1fr]"
                >
                  <div className="glass max-w-sm rounded-[20px] p-4 sm:p-5">
                    <p className="text-sm text-foreground/70">
                      <span className="mr-2 font-semibold text-foreground">#{i + 1}</span>
                      {k.club}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold sm:text-xl">{k.name}</h3>
                    <p className="mt-3 flex items-center gap-3 text-sm">
                      <span className="type-num">{formatINR(k.pricePaise)}</span>
                      <span className="rounded-full bg-foreground/[0.07] px-2.5 py-1 text-xs font-medium">
                        {k.drop ? `Dropping ${formatDropDate(k.drop)}` : "Claims open"}
                      </span>
                    </p>
                  </div>
                  <div aria-hidden="true" className="hidden lg:block" />
                  <div className="glass rounded-[20px] p-4 sm:p-5 lg:justify-self-end">
                    <div className="flex items-end justify-between gap-6">
                      <p>
                        <span className="type-count block text-[clamp(3.2rem,7vw,5.6rem)]" data-count={k.interest}>
                          {formatCount(k.interest)}
                        </span>
                        <span className="mt-2 block text-sm text-foreground/70">claims so far</span>
                      </p>
                      <ul className="flex h-16 items-end gap-1.5" aria-label="Claims by size">
                        {k.sizes.map((s) => (
                          <li key={s.code} className="flex flex-col items-center gap-1" title={`${s.code}: ${s.n}`}>
                            <span className="w-4 rounded-t-sm" style={{ height: `${Math.max(3, (s.n / max) * 44)}px`, background: kitColors(k.slug)[1] }} />
                            <span className="type-num text-[10px] text-foreground/60">{s.code}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link
                      href={`/kits/${k.slug}`}
                prefetch={false}
                      className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-[15px] font-medium text-primary-foreground"
                    >
                      Claim your size
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
