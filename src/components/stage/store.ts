// The live jersey's shared state. The page writes it (scroll choreography, card hovers); the
// renderer reads it every frame and eases toward it. Plain mutable objects on purpose: written by
// GSAP and event handlers, never React state, so nothing re-renders while you scroll.

import { HERO_KIT, kitColors } from "@/lib/kit-palette";

export { HERO_KIT };

export type Pose = {
  /** jersey centre in viewport fractions, from the top left */
  x: number;
  y: number;
  /** jersey height as a fraction of the viewport height */
  h: number;
  /** cap on the jersey's width as a fraction of the viewport width (wins on narrow screens) */
  w: number;
  ry: number;
  rx: number;
  rz: number;
  /** 0 hidden, 1 shown; the jersey scales and fades with it */
  o: number;
};

export const POSE_KEYS = ["x", "y", "h", "w", "ry", "rx", "rz", "o"] as const;

export const pose: Pose = { x: 0.68, y: 0.54, h: 0.74, w: 0.5, ry: -0.42, rx: 0.06, rz: 0, o: 1 };

type KitListener = (slug: string) => void;
const listeners = new Set<KitListener>();

export const stage = {
  kit: HERO_KIT,
  /** set once the renderer has a kit on screen; the page swaps fallbacks for the live jersey */
  live: false,
};

/** Asks the jersey to wear another kit. The page atmosphere follows at once; the print pass runs
 *  as soon as the texture is in. Repeated calls coalesce: only the last request is printed. */
export function showKit(slug: string) {
  if (slug === stage.kit) return;
  stage.kit = slug;
  paintAtmosphere(kitColors(slug));
  listeners.forEach((l) => l(slug));
}

let atmosOn = 0;
/** Paints the hidden atmosphere set in the new colours, then crossfades to it (opacity only). */
function paintAtmosphere([a, b, c]: [string, string, string]) {
  const sets = document.querySelectorAll<HTMLElement>(".atmos-set");
  if (sets.length < 2) return;
  const next = sets[atmosOn ^ 1], prev = sets[atmosOn];
  next.style.setProperty("--a", a);
  next.style.setProperty("--b", b);
  next.style.setProperty("--c", c);
  atmosOn ^= 1;
  requestAnimationFrame(() => {
    next.dataset.on = "true";
    prev.dataset.on = "false";
  });
}

export function onKit(l: KitListener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
