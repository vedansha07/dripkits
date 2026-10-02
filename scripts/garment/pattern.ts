// A football jersey as a real sewing pattern: front, back and two set-in sleeves, V-neck.
// Units are metres, in each panel's own flat 2D space (x right, y up). The panels are
// triangulated here; simulate.ts places them around a mannequin and sews them shut.

import Delaunator from "delaunator";

export type V2 = [number, number];

// ------------------------------------------------------------------ 2D helpers

export const lerp2 = (a: V2, b: V2, t: number): V2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const dist2 = (a: V2, b: V2) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export function polyLength(pts: V2[]) {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += dist2(pts[i - 1], pts[i]);
  return s;
}

/** Uniform arc-length resample of an open polyline into n segments (n+1 points, endpoints kept). */
export function resample(pts: V2[], n: number): V2[] {
  const total = polyLength(pts);
  const out: V2[] = [pts[0]];
  let seg = 1, acc = 0;
  for (let k = 1; k < n; k++) {
    const target = (k / n) * total;
    while (seg < pts.length && acc + dist2(pts[seg - 1], pts[seg]) < target) {
      acc += dist2(pts[seg - 1], pts[seg]);
      seg++;
    }
    const a = pts[seg - 1], b = pts[seg];
    const len = dist2(a, b) || 1e-12;
    out.push(lerp2(a, b, (target - acc) / len));
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/** Densely sampled quadratic Bezier. */
function quad(p0: V2, c: V2, p1: V2, steps = 64): V2[] {
  const out: V2[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, u = 1 - t;
    out.push([u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]]);
  }
  return out;
}

function pointInPoly(p: V2, poly: V2[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function distToLoop(p: V2, loop: V2[]) {
  let best = Infinity;
  for (let i = 0; i < loop.length; i++) {
    const a = loop[i], b = loop[(i + 1) % loop.length];
    const abx = b[0] - a[0], aby = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * abx + (p[1] - a[1]) * aby) / (abx * abx + aby * aby || 1e-12)));
    best = Math.min(best, Math.hypot(p[0] - a[0] - abx * t, p[1] - a[1] - aby * t));
  }
  return best;
}

// ------------------------------------------------------------------ the pattern

export type SegDef = { id: string; pts: V2[] };
export type PanelDef = { name: string; segs: SegDef[] };
export type SeamRef = { panel: string; seg: string };
export type SeamDef = { name: string; a: SeamRef; b: SeamRef & { reverse: boolean } };

export type JerseyPattern = {
  panels: PanelDef[];
  seams: SeamDef[];
  dims: { hemY: number; sideX: number; sleeveW: number; sleeveL: number; capH: number; cuffW: number };
};

/** Size M, regular fit. Chest 106 cm round, back length ~73 cm from the neck point. */
export function jerseyPattern(): JerseyPattern {
  const sideX = 0.265; // half body width
  const hemY = -0.19;
  const A: V2 = [sideX, 0.315]; // armpit
  const S: V2 = [0.2, 0.5]; // shoulder point
  const N: V2 = [0.09, 0.545]; // neck point
  const armCtrl: V2 = [0.212, 0.355];
  const mir = (p: V2): V2 => [-p[0], p[1]];

  const armholeR = quad(A, armCtrl, S); // armpit -> shoulder
  const armholeL = quad(mir(S), mir(armCtrl), mir(A)); // shoulder -> armpit (loop order)

  const body = (name: string, neck: V2[]): PanelDef => ({
    name,
    segs: [
      { id: "hem", pts: [[-sideX, hemY], [sideX, hemY]] },
      { id: "sideR", pts: [[sideX, hemY], A] },
      { id: "armholeR", pts: armholeR },
      { id: "shoulderR", pts: [S, N] },
      { id: "neck", pts: neck },
      { id: "shoulderL", pts: [mir(N), mir(S)] },
      { id: "armholeL", pts: armholeL },
      { id: "sideL", pts: [mir(A), [-sideX, hemY]] },
    ],
  });

  // front: V-neck, 11.5 cm drop. back: shallow curve, 2 cm drop.
  const frontNeck: V2[] = [N, [0.022, 0.455], [0, 0.43], [-0.022, 0.455], mir(N)];
  const backNeck: V2[] = [];
  for (let i = 0; i <= 32; i++) {
    const x = N[0] - (2 * N[0] * i) / 32;
    backNeck.push([x, 0.525 + (N[1] - 0.525) * (x / N[0]) ** 2]);
  }

  // sleeve: bicep 38 cm round, 13 cm underarm length, cuff 35 cm round.
  // The cap height is solved so each half of the cap is 2% longer than the armhole (sleeve ease).
  const sleeveW = 0.38, sleeveL = 0.13, cuffW = 0.35;
  const armholeLen = polyLength(armholeR);
  const capCurve = (capH: number, from: number, to: number) => {
    const pts: V2[] = [];
    for (let i = 0; i <= 96; i++) {
      const u = from + ((to - from) * i) / 96;
      pts.push([u, capH * ((1 + Math.cos((2 * Math.PI * u) / sleeveW)) / 2) ** 0.7]);
    }
    return pts;
  };
  let lo = 0.02, hi = 0.3;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (polyLength(capCurve(mid, sleeveW / 2, 0)) < armholeLen * 1.02) lo = mid; else hi = mid;
  }
  const capH = (lo + hi) / 2;

  const sleeve = (name: string): PanelDef => ({
    name,
    segs: [
      { id: "cuff", pts: [[-cuffW / 2, -sleeveL], [cuffW / 2, -sleeveL]] },
      { id: "underR", pts: [[cuffW / 2, -sleeveL], [sleeveW / 2, 0]] },
      { id: "capB", pts: capCurve(capH, sleeveW / 2, 0) }, // underarm (+) -> top; faces the front
      { id: "capA", pts: capCurve(capH, 0, -sleeveW / 2) }, // top -> underarm (-); faces the back
      { id: "underL", pts: [[-sleeveW / 2, 0], [-cuffW / 2, -sleeveL]] },
    ],
  });

  return {
    panels: [body("front", frontNeck), body("back", backNeck), sleeve("sleeveR"), sleeve("sleeveL")],
    seams: [
      { name: "shoulderR", a: { panel: "front", seg: "shoulderR" }, b: { panel: "back", seg: "shoulderR", reverse: false } },
      { name: "shoulderL", a: { panel: "front", seg: "shoulderL" }, b: { panel: "back", seg: "shoulderL", reverse: false } },
      { name: "sideR", a: { panel: "front", seg: "sideR" }, b: { panel: "back", seg: "sideR", reverse: false } },
      { name: "sideL", a: { panel: "front", seg: "sideL" }, b: { panel: "back", seg: "sideL", reverse: false } },
      { name: "armFrontR", a: { panel: "front", seg: "armholeR" }, b: { panel: "sleeveR", seg: "capB", reverse: false } },
      { name: "armBackR", a: { panel: "back", seg: "armholeR" }, b: { panel: "sleeveR", seg: "capA", reverse: true } },
      { name: "armFrontL", a: { panel: "front", seg: "armholeL" }, b: { panel: "sleeveL", seg: "capB", reverse: true } },
      { name: "armBackL", a: { panel: "back", seg: "armholeL" }, b: { panel: "sleeveL", seg: "capA", reverse: false } },
      { name: "underR", a: { panel: "sleeveR", seg: "underR" }, b: { panel: "sleeveR", seg: "underL", reverse: true } },
      { name: "underL", a: { panel: "sleeveL", seg: "underR" }, b: { panel: "sleeveL", seg: "underL", reverse: true } },
    ],
    dims: { hemY, sideX, sleeveW, sleeveL, capH, cuffW },
  };
}

// ------------------------------------------------------------------ triangulation

export type PanelMesh = {
  name: string;
  pos: V2[]; // flat pattern coordinates
  tris: number[]; // index triples
  loop: number[]; // boundary loop, in order
  segIdx: Record<string, number[]>; // per segment: vertex indices along it, endpoints included
};

/**
 * Samples every segment (seamed pairs get identical counts so their vertices pair 1:1),
 * fills the inside with a triangular lattice, and Delaunay-triangulates.
 */
export function meshPattern(pattern: JerseyPattern, h: number): PanelMesh[] {
  const segLen = new Map<string, number>();
  for (const p of pattern.panels) for (const s of p.segs) segLen.set(`${p.name}/${s.id}`, polyLength(s.pts));
  const counts = new Map<string, number>();
  for (const sm of pattern.seams) {
    const ka = `${sm.a.panel}/${sm.a.seg}`, kb = `${sm.b.panel}/${sm.b.seg}`;
    const n = Math.max(2, Math.round(Math.max(segLen.get(ka)!, segLen.get(kb)!) / h));
    counts.set(ka, n); counts.set(kb, n);
  }

  return pattern.panels.map((panel) => {
    const pos: V2[] = [];
    const loop: number[] = [];
    const segIdx: Record<string, number[]> = {};
    panel.segs.forEach((s, si) => {
      const key = `${panel.name}/${s.id}`;
      const n = counts.get(key) ?? Math.max(1, Math.round(segLen.get(key)! / h));
      const pts = resample(s.pts, n);
      const ids: number[] = [];
      for (let k = 0; k < pts.length; k++) {
        const last = k === pts.length - 1;
        if (last) {
          // shared with the next segment's first point; the final segment closes onto vertex 0
          ids.push(si === panel.segs.length - 1 ? 0 : pos.length);
        } else {
          ids.push(pos.length);
          loop.push(pos.length);
          pos.push(pts[k]);
        }
      }
      segIdx[s.id] = ids;
    });

    const outline = loop.map((i) => pos[i]);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [x, y] of outline) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
    const rowH = (h * Math.sqrt(3)) / 2;
    for (let r = 0, y = minY + rowH / 2; y < maxY; r++, y += rowH) {
      for (let x = minX + (r % 2 ? h / 2 : 0); x < maxX; x += h) {
        const p: V2 = [x, y];
        if (pointInPoly(p, outline) && distToLoop(p, outline) > 0.55 * h) pos.push(p);
      }
    }

    const del = Delaunator.from(pos);
    const tris: number[] = [];
    for (let t = 0; t < del.triangles.length; t += 3) {
      const a = del.triangles[t], b = del.triangles[t + 1], c = del.triangles[t + 2];
      const cen: V2 = [(pos[a][0] + pos[b][0] + pos[c][0]) / 3, (pos[a][1] + pos[b][1] + pos[c][1]) / 3];
      const longest = Math.max(dist2(pos[a], pos[b]), dist2(pos[b], pos[c]), dist2(pos[c], pos[a]));
      // every edge must lie on the cloth: a triangle under the V tip whose edge spans the open
      // notch passes a centroid test, then gets torn open when the neck is sewn
      const onCloth = (p: number, q: number) => {
        const m: V2 = [(pos[p][0] + pos[q][0]) / 2, (pos[p][1] + pos[q][1]) / 2];
        return pointInPoly(m, outline) || distToLoop(m, outline) < 0.15 * h;
      };
      if (longest < 2.4 * h && pointInPoly(cen, outline) && onCloth(a, b) && onCloth(b, c) && onCloth(c, a)) tris.push(a, b, c);
    }
    return { name: panel.name, pos, tris, loop, segIdx };
  });
}
