// Loads the cloth simulation written by scripts/garment/simulate.ts (pnpm garment).
import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

type Rect = { ox: number; oy: number; minX: number; maxY: number };

export type GarmentMeta = {
  vertexCount: number;
  triangleCount: number;
  frameCount: number; // recorded sim frames; the last one is the settled garment
  fps: number;
  pairCount: number;
  panels: Array<{ name: string; start: number; count: number; outline: Array<[number, number]> }>;
  atlas: { size: number; pxPerMetre: number; rects: Record<string, Rect> };
  dims: { hemY: number; sideX: number; sleeveW: number; sleeveL: number; capH: number; cuffW: number };
};

export type Garment = {
  meta: GarmentMeta;
  indices: Uint32Array;
  uv: Float32Array;
  pattern: Float32Array; // flat 2D pattern coordinates per vertex
  panel: Uint8Array; // panel index per vertex
  wrap: Float32Array; // pieces rolled around the mannequin, the sim's first state
  frames: Float32Array; // frameCount * vertexCount * 3
  pairs: Uint32Array; // seam vertex pairs
};

let cache: Promise<Garment> | null = null;

export function loadGarment(): Promise<Garment> {
  cache ??= (async () => {
    const bin = async (name: string) => {
      const res = await fetch(staticFile(`garment/${name}`));
      if (!res.ok) throw new Error(`missing garment/${name}: run pnpm garment`);
      return res.arrayBuffer();
    };
    const meta = (await (await fetch(staticFile("garment/jersey.json"))).json()) as GarmentMeta;
    const [indices, uv, pattern, panel, wrap, frames, pairs] = await Promise.all(
      ["indices.bin", "uv.bin", "pattern.bin", "panel.bin", "wrap.bin", "frames.bin", "pairs.bin"].map(bin),
    );
    return {
      meta,
      indices: new Uint32Array(indices),
      uv: new Float32Array(uv),
      pattern: new Float32Array(pattern),
      panel: new Uint8Array(panel),
      wrap: new Float32Array(wrap),
      frames: new Float32Array(frames),
      pairs: new Uint32Array(pairs),
    };
  })();
  return cache;
}

/** Blocks the Remotion frame until the garment is loaded. */
export function useGarment() {
  const [garment, setGarment] = useState<Garment | null>(null);
  const [handle] = useState(() => delayRender("Loading garment simulation"));
  useEffect(() => {
    loadGarment()
      .then((g) => { setGarment(g); continueRender(handle); })
      .catch((e) => cancelRender(e));
  }, [handle]);
  return garment;
}
