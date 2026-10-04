import Link from "next/link";
import { Crest } from "@/components/brand/crest";
import { getClubs } from "@/lib/queries";

// Club picker as the page's single marquee. Track is doubled so the loop is seamless; the copy is
// hidden from assistive tech and keyboard. Names alternate solid and outlined; home-motion leans
// the band into the scroll direction. Pauses on hover and focus, stops under reduced motion.
export async function CrestMarquee() {
  const clubs = await getClubs();
  if (clubs.length < 4) return null;
  const track = [...clubs, ...clubs];
  return (
    <section aria-label="Shop by club" className="marquee relative z-[3] overflow-hidden py-10">
      <div data-marquee-lean className="will-change-transform">
        <ul className="marquee-track flex w-max items-center gap-12 px-6">
          {track.map((c, i) => {
            const dup = i >= clubs.length;
            return (
              <li key={`${c.id}-${i}`} aria-hidden={dup || undefined}>
                <Link
                  href={`/shop/26-27?club=${c.slug}`}
                  prefetch={false}
                  tabIndex={dup ? -1 : undefined}
                  className="group flex items-center gap-4 whitespace-nowrap"
                >
                  <Crest name={c.name} shortName={c.shortName} color={c.primaryColor} crestUrl={c.crestUrl} size={44} />
                  <span
                    className={
                      i % 2 === 0
                        ? "type-head text-[clamp(2.4rem,5.4vw,4.6rem)] transition-colors group-hover:text-foreground/60"
                        : "type-head text-[clamp(2.4rem,5.4vw,4.6rem)] text-transparent transition-colors [-webkit-text-stroke:1.5px_var(--foreground)] group-hover:text-foreground"
                    }
                  >
                    {c.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
