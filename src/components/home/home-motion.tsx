"use client";

// The home page's choreography. The live jersey travels the whole page: scroll positions taken
// from the sections are keyframes of its pose, and the pose between two keys is eased from one to
// the other, every frame. Sections switch their own states (steps, kits) from ScrollTriggers.
// Reduced motion: nothing here runs; the CSS lays every section out statically.

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { formatCount } from "@/lib/format";
import { HERO_KIT, POSE_KEYS, type Pose, pose, showKit } from "@/components/stage/store";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TAU = Math.PI * 2;
type Poses = Record<"hero" | "howA" | "howHold" | "howFront" | "howB" | "wanted" | "wantedEnd" | "room" | "gone" | "footerIn" | "footer", Pose>;

const P = (x: number, y: number, h: number, w: number, ry: number, o = 1, rx = 0.05, rz = 0): Pose => ({ x, y, h, w, ry, rx, rz, o });

// ry only ever grows, so every move between sections turns the jersey forward
const DESKTOP: Poses = {
  hero: P(0.68, 0.53, 0.74, 0.5, -0.42, 1, 0.06),
  howA: P(0.27, 0.53, 0.7, 0.42, Math.PI + 0.35, 1, 0.03, 0.02),
  howHold: P(0.27, 0.53, 0.7, 0.42, Math.PI + 0.55, 1, 0.03, 0.02),
  howFront: P(0.27, 0.52, 0.72, 0.42, TAU - 0.3),
  howB: P(0.27, 0.52, 0.72, 0.42, TAU - 0.15),
  wanted: P(0.5, 0.5, 0.7, 0.46, TAU - 0.35),
  wantedEnd: P(0.5, 0.5, 0.7, 0.46, TAU + 0.15),
  room: P(0.235, 0.6, 0.54, 0.32, TAU + 0.32, 1, 0.04),
  gone: P(0.3, -0.35, 0.5, 0.32, TAU + 1.6, 0),
  footerIn: P(0.5, 1.3, 0.38, 0.5, 2 * TAU - 1.6, 0),
  footer: P(0.5, 0.5, 0.38, 0.5, 2 * TAU - 0.4, 1, 0.06),
};

const MOBILE: Poses = {
  hero: P(0.5, 0.41, 0.44, 0.86, -0.38, 1, 0.06),
  howA: P(0.5, 0.3, 0.42, 0.74, Math.PI + 0.35, 1, 0.03),
  howHold: P(0.5, 0.3, 0.42, 0.74, Math.PI + 0.55, 1, 0.03),
  howFront: P(0.5, 0.3, 0.42, 0.74, TAU - 0.3),
  howB: P(0.5, 0.3, 0.42, 0.74, TAU - 0.15),
  wanted: P(0.5, 0.39, 0.33, 0.7, TAU - 0.35),
  wantedEnd: P(0.5, 0.39, 0.33, 0.7, TAU + 0.15),
  room: P(0.5, -0.3, 0.3, 0.6, TAU + 1.2, 0),
  gone: P(0.5, -0.3, 0.3, 0.6, TAU + 1.6, 0),
  footerIn: P(0.5, 1.3, 0.36, 0.8, 2 * TAU - 1.6, 0),
  footer: P(0.5, 0.6, 0.36, 0.8, 2 * TAU - 0.4, 1, 0.06),
};

type Key = { at: number; pose: Pose };
const ease = gsap.parseEase("sine.inOut");

function writePose(keys: Key[], y: number) {
  if (keys.length === 0) return;
  let i = 0;
  while (i < keys.length - 2 && y > keys[i + 1].at) i++;
  const a = keys[i], b = keys[i + 1] ?? a;
  const t = b.at > a.at ? ease(Math.min(1, Math.max(0, (y - a.at) / (b.at - a.at)))) : 1;
  for (const k of POSE_KEYS) pose[k] = a.pose[k] + (b.pose[k] - a.pose[k]) * t;
}

function countUp(el: HTMLElement | null | undefined) {
  if (!el || el.dataset.counted) return;
  el.dataset.counted = "1";
  const target = Number(el.dataset.count ?? 0);
  const o = { v: 0 };
  gsap.to(o, { v: target, duration: 1.6, ease: "power3.out", onUpdate: () => { el.textContent = formatCount(Math.round(o.v)); } });
}

/** Index of the slice of a progress range, for sections that step through n states. */
const slice = (progress: number, n: number) => Math.min(n - 1, Math.floor(progress * n * 0.999));

export function HomeMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(
      { desktop: "(min-width: 1024px)", mobile: "(max-width: 1023px)", reduce: "(prefers-reduced-motion: reduce)" },
      (ctx) => {
        const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean };
        if (reduce) return;
        const poses = desktop ? DESKTOP : MOBILE;
        Object.assign(pose, poses.hero);

        const q = <T extends Element>(s: string) => document.querySelector<T>(s);
        const qa = <T extends Element>(s: string) => Array.from(document.querySelectorAll<T>(s));
        const anchor = (sel: string, vars: ScrollTrigger.Vars = {}) =>
          q(sel) ? ScrollTrigger.create({ trigger: sel, start: "top top", end: "bottom bottom", ...vars }) : null;

        // ---- how it works: one step per third, the hero kit ----
        const steps = qa<HTMLElement>("[data-how-step]");
        const stepTicks = qa<HTMLElement>("[data-how-tick]");
        let step = 0;
        const how = anchor("#how", {
          onEnter: () => showKit(HERO_KIT),
          onEnterBack: () => showKit(HERO_KIT),
          onUpdate: (self) => {
            const s = slice(self.progress, steps.length);
            if (s === step) return;
            step = s;
            steps.forEach((el, i) => { el.dataset.state = i === s ? "on" : "off"; });
            stepTicks.forEach((el, i) => { el.dataset.on = String(i <= s); });
            if (s === 1) countUp(steps[1]?.querySelector<HTMLElement>("[data-count]"));
          },
        });

        // ---- most wanted: one kit per slice ----
        const slugs = (q<HTMLElement>("#wanted")?.dataset.kits ?? "").split(",").filter(Boolean);
        const names = qa<HTMLElement>("[data-wanted-name]");
        const panels = qa<HTMLElement>("[data-wanted-panel]");
        const wantedTicks = qa<HTMLElement>("[data-wanted-tick]");
        const stills = qa<HTMLElement>("[data-wanted-still]");
        let shown = -1;
        const showWanted = (idx: number, force = false) => {
          if (idx === shown && !force) return;
          shown = idx;
          names.forEach((el, i) => { el.dataset.state = i === idx ? "on" : i < idx ? "past" : "next"; });
          panels.forEach((el, i) => { el.dataset.state = i === idx ? "on" : "off"; });
          wantedTicks.forEach((el, i) => { el.dataset.on = String(i === idx); });
          stills.forEach((el, i) => { el.dataset.off = String(i !== idx); });
          countUp(panels[idx]?.querySelector<HTMLElement>("[data-count]"));
          if (slugs[idx]) showKit(slugs[idx]);
        };
        const wanted = slugs.length
          ? anchor("#wanted", {
              onUpdate: (self) => showWanted(slice(self.progress, slugs.length)),
              onEnter: (self) => showWanted(slice(self.progress, slugs.length), true),
              onEnterBack: (self) => showWanted(slice(self.progress, slugs.length), true),
            })
          : null;

        // ---- the table: wear the card you were on, or the first ----
        const tableEl = q<HTMLElement>("#table");
        const wearTable = () => {
          const kit = tableEl?.querySelector<HTMLElement>("a[data-active=true]")?.dataset.kit ?? tableEl?.dataset.firstKit;
          showKit(kit ?? HERO_KIT);
        };
        const room = anchor("#table", { onEnter: wearTable, onEnterBack: wearTable });
        if (tableEl) {
          const below = qa<HTMLElement>("#table li").filter((el) => el.getBoundingClientRect().top > window.innerHeight);
          gsap.set(below, { y: 48, opacity: 0 });
          ScrollTrigger.batch(below, {
            start: "top 94%",
            once: true,
            onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 0.9, stagger: 0.07, ease: "expo.out", overwrite: true }),
          });
        }

        const players = anchor("#players", { start: "top bottom", end: "top top" });
        const footer = anchor("#footer", { start: "top bottom", end: "bottom bottom", onEnter: () => showKit(HERO_KIT) });
        ScrollTrigger.create({ trigger: "#hero", start: "top top", end: "bottom top", onEnterBack: () => showKit(HERO_KIT) });

        // ---- the jersey's path ----
        let keys: Key[] = [];
        const buildKeys = () => {
          const vh = window.innerHeight;
          const k: Key[] = [{ at: 0, pose: poses.hero }];
          if (how) {
            const len = how.end - how.start;
            k.push(
              { at: how.start, pose: poses.howA },
              { at: how.start + len * 0.3, pose: poses.howHold },
              { at: how.start + len * 0.72, pose: poses.howFront },
              { at: how.end, pose: poses.howB },
            );
          }
          if (wanted) k.push({ at: wanted.start, pose: poses.wanted }, { at: wanted.end, pose: poses.wantedEnd });
          if (room) k.push({ at: room.start + vh * 0.1, pose: poses.room }, { at: Math.max(room.start + vh * 0.2, room.end - vh * 0.1), pose: poses.room });
          if (players) k.push({ at: players.start + vh * 0.55, pose: poses.gone });
          if (footer) k.push({ at: footer.start + vh * 0.05, pose: poses.footerIn }, { at: footer.end, pose: poses.footer });
          keys = k.sort((x, y) => x.at - y.at);
        };
        ScrollTrigger.addEventListener("refresh", buildKeys);
        const follow = () => writePose(keys, window.scrollY);
        gsap.ticker.add(follow);

        // ---- type in motion ----
        gsap.to(".hero-word", { yPercent: -22, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
        const lean = q("[data-marquee-lean]");
        if (lean) {
          const skew = gsap.quickTo(lean, "skewX", { duration: 0.6, ease: "power3" });
          ScrollTrigger.create({ start: 0, end: "max", onUpdate: (self) => skew(gsap.utils.clamp(-9, 9, self.getVelocity() / -260)) });
        }
        if (q("[data-footer-word]")) {
          gsap.fromTo("[data-footer-word]", { yPercent: 45 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: "#footer", start: "top bottom", end: "bottom bottom", scrub: true } });
        }

        ScrollTrigger.refresh();
        buildKeys();
        return () => {
          gsap.ticker.remove(follow);
          ScrollTrigger.removeEventListener("refresh", buildKeys);
        };
      },
    );
    return () => mm.revert();
  });

  return null;
}
