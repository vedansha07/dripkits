"use client";

// The header floats over everything; it tucks away while you scroll down into the page and comes
// back the moment you scroll up. Driven by ScrollTrigger's direction, not a scroll listener.

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function HeaderShell({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const hide = self.direction === 1 && self.scroll() > window.innerHeight * 0.6;
        if ((el.dataset.hidden === "true") !== hide) el.dataset.hidden = String(hide);
      },
    });
  });

  return (
    <header
      ref={ref}
      data-hidden="false"
      className="fixed inset-x-0 top-3 z-40 px-3 transition-[translate,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:translate-y-0 focus-within:opacity-100 data-[hidden=true]:-translate-y-24 data-[hidden=true]:opacity-0 sm:top-4"
    >
      {children}
    </header>
  );
}
