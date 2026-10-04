"use client";

// Mounts the live jersey on the client only, and not at all for reduced motion: those visitors
// keep the still product images the sections ship with.

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

const JerseyStage = dynamic(() => import("./jersey-stage"), { ssr: false });

const QUERY = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function StageLoader() {
  const reduce = useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => true);
  return reduce ? null : <JerseyStage />;
}
