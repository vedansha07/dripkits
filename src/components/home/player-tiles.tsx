import Image from "next/image";
import Link from "next/link";
import { Crest } from "@/components/brand/crest";
import { getPlayers } from "@/lib/queries";

// Four players, four cells, asymmetric: 7/5 then 5/7 on desktop, single column on mobile.
const SPAN = ["md:col-span-7", "md:col-span-5", "md:col-span-5", "md:col-span-7"];

export async function PlayerTiles() {
  const players = await getPlayers(4);
  if (players.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      <h2 className="type-display mb-8 text-4xl md:text-6xl">Shop by player</h2>
      <ul className="grid gap-3 md:grid-cols-12 md:gap-4">
        {players.map((p, i) => (
          <li key={p.id} className={SPAN[i % SPAN.length]}>
              <Link
                href={`/shop/26-27?player=${p.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden bg-card md:aspect-[16/10]"
              >
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    sizes="(min-width: 768px) 58vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-out md:group-hover:scale-[1.04]"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                  <span className="type-display text-4xl leading-none text-white md:text-5xl">{p.name}</span>
                  {p.club ? (
                    <Crest name={p.club.name} shortName={p.club.shortName} color={p.club.primaryColor} crestUrl={p.club.crestUrl} size={40} />
                  ) : null}
                </div>
              </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
