"use client";

// Scroll-scrubbed frame sequence (rendered offline in Remotion, see remotion/ and scripts/sequence).
// A tall section with a sticky stage; scroll position picks the frame, drawn to one canvas.
// Progress is published as the CSS variable --p (0..1) and data-step on the stage, so copy and
// background layers can follow the frames without any React re-render.
//
// Frames load coarse to fine (both ends, then every 32nd, 16th ... 1st), so wherever the reader
// is, a near frame is already decoded. Reduced motion: a static finished frame, no pinning.

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type SequenceManifest = {
  name: string;
  frames: number;
  sizes: number[];
  crop: { x: number; y: number; w: number; h: number };
};

const frameUrl = (m: SequenceManifest, size: number, i: number) =>
  `/sequences/${m.name}/${size}/${String(i).padStart(4, "0")}.webp`;

function loadOrder(n: number) {
  const seen = new Set<number>();
  const order: number[] = [];
  const push = (i: number) => {
    if (i >= 0 && i < n && !seen.has(i)) { seen.add(i); order.push(i); }
  };
  push(0); push(n - 1);
  for (const stride of [32, 16, 8, 4, 2, 1]) for (let i = 0; i < n; i += stride) push(i);
  return order;
}

/** Thresholds for data-step; CSS reads them to switch copy that must not stay clickable when hidden. */
export type Steps = number[];

export function ScrollSequence({
  manifest,
  scrollVh = 220,
  steps = [],
  back,
  boxBack,
  front,
  posterAlt,
  className,
  boxClassName,
}: {
  manifest: SequenceManifest;
  /** extra scroll distance, in viewport heights, the stage stays pinned for */
  scrollVh?: number;
  steps?: Steps;
  back?: React.ReactNode;
  /** inside the frame box, behind the frames: anything that must sit exactly behind the subject */
  boxBack?: React.ReactNode;
  front?: React.ReactNode;
  posterAlt: string;
  className?: string;
  /** sizing/positioning of the square frame box */
  boxClassName?: string;
}) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const poster = useRef<HTMLImageElement>(null);
  const { frames: n, crop } = manifest;
  const small = manifest.sizes[manifest.sizes.length - 1];
  const large = manifest.sizes[0];

  useGSAP(
    () => {
      const sec = section.current, stg = stage.current, bx = box.current, cv = canvas.current;
      if (!sec || !stg || !bx || !cv) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        stg.style.setProperty("--p", "1");
        stg.dataset.step = String(steps.length);
        return;
      }
      const ctx = cv.getContext("2d");
      if (!ctx) return;

      const imgs: Array<HTMLImageElement | null> = new Array(n).fill(null);
      let target = 0;
      let shown = -1;
      let alive = true;
      let size = large;

      const nearest = (i: number) => {
        if (imgs[i]) return i;
        for (let d = 1; d < n; d++) {
          if (i - d >= 0 && imgs[i - d]) return i - d;
          if (i + d < n && imgs[i + d]) return i + d;
        }
        return -1;
      };
      const draw = (force = false) => {
        const k = nearest(target);
        if (k < 0 || (k === shown && !force)) return;
        shown = k;
        const W = cv.width;
        ctx.clearRect(0, 0, W, W);
        ctx.drawImage(imgs[k]!, crop.x * W, crop.y * W, crop.w * W, crop.h * W);
        if (cv.style.opacity !== "1") {
          cv.style.opacity = "1";
          if (poster.current) poster.current.style.opacity = "0";
        }
      };

      const fit = () => {
        const css = bx.getBoundingClientRect().width;
        const px = Math.round(css * Math.min(window.devicePixelRatio || 1, 2));
        if (px > 0 && cv.width !== px) { cv.width = px; cv.height = px; draw(true); }
        return px;
      };
      size = fit() * crop.w > 560 ? large : small;
      const ro = new ResizeObserver(() => fit());
      ro.observe(bx);

      // loader: a small pool, coarse-to-fine order
      const order = loadOrder(n);
      let next = 0;
      const pump = async () => {
        while (alive && next < order.length) {
          const i = order[next++];
          const img = new Image();
          img.decoding = "async";
          img.src = frameUrl(manifest, size, i);
          try { await img.decode(); } catch { continue; }
          if (!alive) return;
          imgs[i] = img;
          // repaint if this frame is closer to where the reader is than what is on screen
          if (Math.abs(i - target) < Math.abs(shown - target) || shown < 0) draw(true);
        }
      };
      for (let k = 0; k < 6; k++) void pump();

      const state = { f: 0 };
      gsap.to(state, {
        f: n - 1,
        ease: "none",
        scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.35 },
        onUpdate: () => {
          target = Math.round(state.f);
          draw();
          const p = state.f / (n - 1);
          stg.style.setProperty("--p", p.toFixed(4));
          let step = 0;
          while (step < steps.length && p >= steps[step]) step++;
          if (stg.dataset.step !== String(step)) stg.dataset.step = String(step);
        },
      });

      return () => { alive = false; ro.disconnect(); };
    },
    { scope: section, dependencies: [manifest.name] },
  );

  const first = (s: number) => frameUrl(manifest, s, 0);
  const last = (s: number) => frameUrl(manifest, s, n - 1);
  const pxW = (s: number) => Math.round(s * crop.w);

  return (
    <section ref={section} className={cn("seq-section relative", className)} style={{ height: `calc(100svh + ${scrollVh}svh)` }}>
      <div ref={stage} className="seq-stage sticky top-0 h-[100svh] overflow-hidden" data-step="0" style={{ ["--p" as string]: 0 }}>
        {back}
        <div ref={box} className={cn("absolute aspect-square", boxClassName)}>
          {boxBack}
          {/* poster: frame 0 for first paint and no-JS; the finished frame under reduced motion */}
          <picture>
            <source media="(prefers-reduced-motion: reduce)" srcSet={`${last(small)} ${pxW(small)}w, ${last(large)} ${pxW(large)}w`} />
            <img
              ref={poster}
              src={first(large)}
              srcSet={`${first(small)} ${pxW(small)}w, ${first(large)} ${pxW(large)}w`}
              sizes="(min-width: 1024px) 60vw, 90vw"
              alt={posterAlt}
              fetchPriority="high"
              className="absolute transition-opacity duration-300"
              style={{ left: `${crop.x * 100}%`, top: `${crop.y * 100}%`, width: `${crop.w * 100}%`, height: `${crop.h * 100}%` }}
            />
          </picture>
          <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 size-full opacity-0" />
        </div>
        {front}
      </div>
    </section>
  );
}
