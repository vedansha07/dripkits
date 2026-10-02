"use client";

// Over the hero the header is transparent ink-on-yellow; once the hero has scrolled past, it turns
// solid. An IntersectionObserver on the hero section, no scroll listener.

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function HeaderShell({ overlay, children }: { overlay: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    const hero = document.querySelector(".seq-section");
    if (!overlay || !el || !hero) return;
    const io = new IntersectionObserver(
      ([e]) => { el.dataset.solid = e.isIntersecting ? "false" : "true"; },
      { rootMargin: "-64px 0px 0px 0px" },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [overlay]);

  return (
    <header
      ref={ref}
      data-solid={overlay ? "false" : "true"}
      className={cn(
        "z-40 border-b border-transparent transition-[background-color,border-color] duration-300",
        overlay ? "fixed inset-x-0 top-0" : "sticky top-0",
        "data-[solid=true]:border-border/70 data-[solid=true]:bg-background/85 data-[solid=true]:backdrop-blur",
      )}
    >
      {children}
    </header>
  );
}
