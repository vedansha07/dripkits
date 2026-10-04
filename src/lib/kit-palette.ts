// Three colours per kit for the page atmosphere: the dominant body colour, a second colour, and
// the trim or ink accent. Read from the dummy kit designs; his real kits can carry their own later.

import { DESIGNS, type KitDesign } from "../../remotion/jersey/designs";

export type KitColors = [string, string, string];

/** The kit the jersey wears in the hero and comes back to in the footer. */
export const HERO_KIT = "barcelona-home-26-27";

const FALLBACK: KitColors = ["#14388A", "#8A1437", "#E3B53E"];

function fromDesign(d: KitDesign): KitColors {
  switch (d.body.kind) {
    case "stripes": {
      const mids = [...new Set(d.body.stripes.map((s) => s.c[1]))];
      return [mids[0], mids[1] ?? d.trim, d.ink];
    }
    case "band":
      return [d.body.base[1], d.body.band[1], d.ink];
    case "solid":
      return [d.body.c[1], d.trim, d.ink];
  }
}

export function kitColors(slug: string): KitColors {
  const d = DESIGNS[slug];
  return d ? fromDesign(d) : FALLBACK;
}

/** The texture atlas the live jersey wears for a product (pnpm kits:render): 2048 px, or 1024 px
 *  on small screens, where the jersey is small and memory and upload time are tighter. */
export const kitAtlasUrl = (slug: string) =>
  typeof window !== "undefined" && window.innerWidth < 768 ? `/kits/1024/${slug}.webp` : `/kits/${slug}.webp`;

export const hasKitAtlas = (slug: string) => slug in DESIGNS;
