// The sewing intro, in real time: the four flat pattern pieces fly in, curl around the body and
// are sewn shut. Same choreography as remotion/scenes/HeroBuild.tsx; data from
// scripts/garment/export-web.ts. Time is in HeroBuild frames (30 fps, 0 to 150).

import * as THREE from "three";
import { gsap } from "gsap";

type PanelPlan = {
  name: string;
  start: number;
  count: number;
  cu: number;
  cv: number;
  qL: [number, number, number, number];
  qP: [number, number, number, number];
  cL: [number, number, number];
  cP: [number, number, number];
  delay: number;
  curl: [number, number];
};

type BuildMeta = {
  vertexCount: number;
  size: [number, number, number];
  range: [number, number];
  patternRange: [number, number];
  keyframes: number[];
  panels: PanelPlan[];
};

export type Build = {
  n: number;
  panels: Array<PanelPlan & { ql: THREE.Quaternion; qp: THREE.Quaternion }>;
  pattern: Float32Array;
  prewrap: Float32Array;
  wrap: Float32Array;
  keys: Float32Array[];
  keyframes: number[];
};

export const BUILD_FRAMES = 150;

let cache: Promise<Build> | null = null;

export function loadBuild(): Promise<Build> {
  cache ??= (async () => {
    const [meta, raw] = await Promise.all([
      fetch("/models/jersey-build.json").then((r) => r.json() as Promise<BuildMeta>),
      fetch("/models/jersey-build.bin.gz").then(async (r) => {
        if (!r.ok || !r.body) throw new Error("jersey-build.bin.gz missing");
        return new Response(r.body.pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
      }),
    ]);
    // byte planes back into int16: all low bytes first, then all high bytes
    const bytes = new Uint8Array(raw);
    const count = bytes.length / 2;
    const q = new Int16Array(count);
    for (let i = 0; i < count; i++) q[i] = bytes[i] | (bytes[count + i] << 8);

    const n = meta.vertexCount;
    let o = 0;
    const take = (len: number) => q.subarray(o, (o += len));
    const deq = (src: Int16Array, [lo, hi]: [number, number]) => {
      const s = (hi - lo) / 65534;
      const out = new Float32Array(src.length);
      for (let i = 0; i < src.length; i++) out[i] = (src[i] + 32767) * s + lo;
      return out;
    };
    const pattern = deq(take(n * 2), meta.patternRange);
    const qPre = take(n * 3);
    const qWrap = take(n * 3);
    // keyframes are delta coded from the previous one, the first from wrap
    let prev = qWrap;
    const keys = meta.keyframes.map(() => {
      const d = take(n * 3);
      const k = new Int16Array(n * 3);
      for (let i = 0; i < k.length; i++) k[i] = prev[i] + d[i];
      prev = k;
      return deq(k, meta.range);
    });
    return {
      n,
      panels: meta.panels.map((p) => ({ ...p, ql: new THREE.Quaternion(...p.qL), qp: new THREE.Quaternion(...p.qP) })),
      pattern,
      prewrap: deq(qPre, meta.range),
      wrap: deq(qWrap, meta.range),
      keys,
      keyframes: meta.keyframes,
    };
  })();
  return cache;
}

const ease = gsap.parseEase("power3.inOut");
const easeOut = gsap.parseEase("expo.out");
const easeSew = gsap.parseEase("power2.out");
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const span = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));

const q = new THREE.Quaternion();
const d = new THREE.Vector3();

/** Writes the garment's shape at intro frame f into out (vertexCount * 3). */
export function buildFrame(b: Build, f: number, out: Float32Array) {
  if (f >= 74) {
    // sewing and drape: simulation keyframes, quick at first, then easing into rest
    const sim = f < 124 ? easeSew(span(f, 74, 124)) * 112 : 112 + easeOut(span(f, 124, BUILD_FRAMES)) * 80;
    const k = b.keyframes;
    let i = 0;
    while (i < k.length - 2 && sim > k[i + 1]) i++;
    const t = clamp01((sim - k[i]) / (k[i + 1] - k[i]));
    const A = b.keys[i], B = b.keys[i + 1];
    for (let j = 0; j < out.length; j++) out[j] = A[j] + (B[j] - A[j]) * t;
    return;
  }
  for (const p of b.panels) {
    const tFly = ease(span(f, 12 + p.delay, 50 + p.delay));
    const tCurl = ease(span(f, p.curl[0], p.curl[1]));
    q.slerpQuaternions(p.ql, p.qp, tFly);
    const arc = Math.sin(Math.PI * tFly) * 0.22; // swing toward the camera mid-flight
    const cx = p.cL[0] + (p.cP[0] - p.cL[0]) * tFly;
    const cy = p.cL[1] + (p.cP[1] - p.cL[1]) * tFly;
    const cz = p.cL[2] + (p.cP[2] - p.cL[2]) * tFly + arc;
    for (let i = p.start; i < p.start + p.count; i++) {
      d.set(b.pattern[i * 2] - p.cu, b.pattern[i * 2 + 1] - p.cv, 0).applyQuaternion(q);
      let x = cx + d.x, y = cy + d.y, z = cz + d.z;
      if (tCurl > 0) {
        x += (b.wrap[i * 3] - b.prewrap[i * 3]) * tCurl;
        y += (b.wrap[i * 3 + 1] - b.prewrap[i * 3 + 1]) * tCurl;
        z += (b.wrap[i * 3 + 2] - b.prewrap[i * 3 + 2]) * tCurl;
      }
      out[i * 3] = x;
      out[i * 3 + 1] = y;
      out[i * 3 + 2] = z;
    }
  }
}

/** HeroBuild dollied the camera in as the shirt came together; here the jersey grows instead. */
export function buildScale(f: number) {
  return f < 70 ? 0.663 + (0.845 - 0.663) * ease(span(f, 0, 70)) : 0.845 + (1 - 0.845) * ease(span(f, 70, BUILD_FRAMES));
}

/** How far the jersey has turned from facing front toward its pose, through the intro. */
export function buildTurn(f: number) {
  return easeOut(span(f, 112, BUILD_FRAMES));
}
