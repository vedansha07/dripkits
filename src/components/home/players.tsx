import Image from "next/image";
import Link from "next/link";

// Shop by player: the kit each player is sold on, shown from the back where the name goes.
// A scroll-snap row on phones, an asymmetric four-up on desktop.

export type PlayerKit = {
  slug: string;
  name: string;
  club: string;
  clubColor: string;
  kitSlug: string | null;
  kitName: string | null;
  back: string | null;
};

export function Players({ players }: { players: PlayerKit[] }) {
  if (players.length === 0) return null;
  return (
    <section id="players" className="relative z-[3] py-24" aria-labelledby="players-title">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
        <h2 id="players-title" className="type-head text-[clamp(2.4rem,5vw,4.6rem)]">
          Shop by player.
        </h2>
        <p className="mt-3 max-w-md text-base text-foreground/70">The kits the biggest names wear this season.</p>
      </div>
      <ul className="mx-auto mt-10 flex max-w-[1400px] snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 sm:px-8 lg:grid lg:grid-cols-[1.25fr_1fr_1fr_1.25fr] lg:gap-4 lg:overflow-visible lg:pb-0">
        {players.map((p, i) => (
          <li key={p.slug} className={i % 2 === 1 ? "w-[72vw] shrink-0 snap-start sm:w-[44vw] lg:mt-16 lg:w-auto" : "w-[72vw] shrink-0 snap-start sm:w-[44vw] lg:w-auto"}>
            <Link
              href={p.kitSlug ? `/kits/${p.kitSlug}` : `/shop/26-27`}
              prefetch={false}
              className="group relative block overflow-hidden rounded-[28px] outline-none ring-foreground focus-visible:ring-2"
              style={{ background: `linear-gradient(160deg, color-mix(in oklab, ${p.clubColor} 34%, var(--card)), color-mix(in oklab, ${p.clubColor} 10%, var(--card)))` }}
            >
              <div className="relative aspect-[3/4]">
                {p.back ? (
                  <Image
                    src={p.back}
                    alt={p.kitName ? `${p.kitName}, back` : ""}
                    fill
                    sizes="(min-width: 1024px) 26vw, 72vw"
                    className="object-contain p-6 pt-16 transition-transform duration-700 ease-out md:group-hover:-translate-y-2 md:group-hover:scale-[1.03]"
                  />
                ) : null}
              </div>
              <div className="absolute inset-x-0 top-0 p-5">
                <p className="type-giant text-[clamp(1.7rem,2.3vw,2.5rem)] leading-[0.85]">{p.name.split(" ").slice(-1)[0]}</p>
                <p className="mt-2 text-sm text-foreground/70">{p.club}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
