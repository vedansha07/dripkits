import Link from "next/link";
import { Crest } from "@/components/brand/crest";
import { getClubs } from "@/lib/queries";

// Club picker as the page's single marquee. Track is doubled so the loop is seamless; the copy is
// hidden from assistive tech and keyboard. Pauses on hover and focus, stops under reduced motion.
export async function CrestMarquee() {
  const clubs = await getClubs();
  if (clubs.length < 4) return null;
  const track = [...clubs, ...clubs];
  return (
    <section aria-label="Shop by club" className="marquee overflow-hidden border-y border-border py-5">
      <ul className="marquee-track flex w-max items-center gap-10 px-5">
        {track.map((c, i) => {
          const dup = i >= clubs.length;
          return (
            <li key={`${c.id}-${i}`} aria-hidden={dup || undefined}>
              <Link
                href={`/shop/26-27?club=${c.slug}`}
                tabIndex={dup ? -1 : undefined}
                className="flex items-center gap-3 whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
              >
                <Crest name={c.name} shortName={c.shortName} color={c.primaryColor} crestUrl={c.crestUrl} size={36} />
                <span className="type-display text-2xl">{c.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
