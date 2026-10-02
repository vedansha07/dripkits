// Sews the jersey pattern onto an invisible mannequin with an XPBD cloth solver ("small steps":
// many substeps, one constraint pass each) and records every frame for the Remotion scene.
//
// Run: pnpm garment         (writes remotion/public/garment/*)
// Deterministic: no randomness, so the same pattern always produces the same drape.

import { mkdirSync, writeFileSync } from "node:fs";
import { jerseyPattern, meshPattern } from "./pattern";
import { ARMS, WRAP, sdf } from "./mannequin";

const OUT = "remotion/public/garment";
const H = 0.012; // triangle edge, metres
const FPS = 60;
const SUBSTEPS = 24;
const RECORD_SECONDS = 3.2; // the sewing and the drape, recorded frame by frame
const SETTLE_SECONDS = 2.0; // then damped down to rest; only the final state is kept
const DENSITY = 0.17; // kg/m2, a 170 gsm polyester jersey
const THICK = 0.0045; // collision skin, metres
const BEND_COMPLIANCE = 0.09;

// ------------------------------------------------------------------ build the garment

const pattern = jerseyPattern();
const panels = meshPattern(pattern, H);
const panelIndex = Object.fromEntries(panels.map((p, i) => [p.name, i]));

const N = panels.reduce((n, p) => n + p.pos.length, 0);
const base: number[] = [];
{ let o = 0; for (const p of panels) { base.push(o); o += p.pos.length; } }

const pat2 = new Float32Array(N * 2); // flat pattern coordinates
const panelOf = new Uint8Array(N);
panels.forEach((p, pi) => p.pos.forEach(([x, y], i) => {
  pat2[(base[pi] + i) * 2] = x; pat2[(base[pi] + i) * 2 + 1] = y; panelOf[base[pi] + i] = pi;
}));

// ---- placement: body panels wrapped isometrically on an elliptic cylinder, sleeves rolled into
// tubes around the arms. Isometric means no constraint starts stretched, so nothing explodes.
const ELL_A = WRAP.ellA, ELL_B = WRAP.ellB;
const arcTable: Array<[number, number]> = [];
{
  let s = 0, px = 0, pz = ELL_B;
  for (let i = 0; i <= 4000; i++) {
    const t = (i / 4000) * Math.PI;
    const x = ELL_A * Math.sin(t), z = ELL_B * Math.cos(t);
    s += Math.hypot(x - px, z - pz); px = x; pz = z;
    arcTable.push([s, t]);
  }
}
function ellipseAt(arc: number): [number, number] {
  const a = Math.abs(arc);
  let lo = 0, hi = arcTable.length - 1;
  while (lo < hi) { const m = (lo + hi) >> 1; if (arcTable[m][0] < a) lo = m + 1; else hi = m; }
  const t = arcTable[lo][1];
  return [Math.sign(arc) * ELL_A * Math.sin(t), ELL_B * Math.cos(t)];
}

const x = new Float32Array(N * 3);
const R_SLEEVE = pattern.dims.sleeveW / (2 * Math.PI);
for (let i = 0; i < N; i++) {
  const u = pat2[i * 2], v = pat2[i * 2 + 1];
  const name = panels[panelOf[i]].name;
  if (name === "front" || name === "back") {
    const [ex, ez] = ellipseAt(u);
    x[i * 3] = ex; x[i * 3 + 1] = v; x[i * 3 + 2] = name === "front" ? ez : -ez;
  } else {
    const arm = ARMS[name === "sleeveR" ? 0 : 1];
    const s = WRAP.sleeveS0 + (pattern.dims.capH - v);
    const th = u / R_SLEEVE;
    const c = Math.cos(th), sn = Math.sin(th);
    x[i * 3] = arm.joint[0] + arm.dir[0] * s + R_SLEEVE * c * arm.up[0];
    x[i * 3 + 1] = arm.joint[1] + arm.dir[1] * s + R_SLEEVE * c * arm.up[1];
    x[i * 3 + 2] = arm.joint[2] + arm.dir[2] * s + R_SLEEVE * sn;
  }
}
const wrap = Float32Array.from(x);

// ---- triangles, with winding fixed so every panel's normals point away from the body
const tris: number[] = [];
panels.forEach((p, pi) => {
  const local: number[] = p.tris.map((i) => i + base[pi]);
  let score = 0;
  for (let t = 0; t < local.length; t += 3) {
    const [a, b, c] = [local[t], local[t + 1], local[t + 2]];
    const e1 = [x[b * 3] - x[a * 3], x[b * 3 + 1] - x[a * 3 + 1], x[b * 3 + 2] - x[a * 3 + 2]];
    const e2 = [x[c * 3] - x[a * 3], x[c * 3 + 1] - x[a * 3 + 1], x[c * 3 + 2] - x[a * 3 + 2]];
    const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    const cx = (x[a * 3] + x[b * 3] + x[c * 3]) / 3, cy = (x[a * 3 + 1] + x[b * 3 + 1] + x[c * 3 + 1]) / 3, cz = (x[a * 3 + 2] + x[b * 3 + 2] + x[c * 3 + 2]) / 3;
    let out: number[];
    if (p.name === "front" || p.name === "back") out = [cx, 0, cz];
    else {
      const arm = ARMS[p.name === "sleeveR" ? 0 : 1];
      const qx = cx - arm.joint[0], qy = cy - arm.joint[1], qz = cz - arm.joint[2];
      const along = qx * arm.dir[0] + qy * arm.dir[1] + qz * arm.dir[2];
      out = [qx - along * arm.dir[0], qy - along * arm.dir[1], qz - along * arm.dir[2]];
    }
    score += n[0] * out[0] + n[1] * out[1] + n[2] * out[2];
  }
  const flip = score < 0;
  for (let t = 0; t < local.length; t += 3) {
    if (flip) tris.push(local[t], local[t + 2], local[t + 1]);
    else tris.push(local[t], local[t + 1], local[t + 2]);
  }
  console.log(`${p.name.padEnd(8)} verts ${String(p.pos.length).padStart(5)}  winding ${flip ? "flipped" : "kept"}`);
});

// ---- masses
const invMass = new Float32Array(N);
{
  const mass = new Float32Array(N);
  for (let t = 0; t < tris.length; t += 3) {
    const [a, b, c] = [tris[t], tris[t + 1], tris[t + 2]];
    const area = Math.abs((pat2[b * 2] - pat2[a * 2]) * (pat2[c * 2 + 1] - pat2[a * 2 + 1]) - (pat2[c * 2] - pat2[a * 2]) * (pat2[b * 2 + 1] - pat2[a * 2 + 1])) / 2;
    for (const v of [a, b, c]) mass[v] += (area * DENSITY) / 3;
  }
  for (let i = 0; i < N; i++) invMass[i] = mass[i] > 0 ? 1 / mass[i] : 0;
}

// ---- constraints: stretch (every edge), bend (across every interior edge), sew (seam pairs)
const restOf = (a: number, b: number) => Math.hypot(pat2[a * 2] - pat2[b * 2], pat2[a * 2 + 1] - pat2[b * 2 + 1]);
const edgeMap = new Map<number, number[]>();
for (let t = 0; t < tris.length; t += 3) {
  for (let k = 0; k < 3; k++) {
    const a = tris[t + k], b = tris[t + ((k + 1) % 3)], opp = tris[t + ((k + 2) % 3)];
    const key = a < b ? a * N + b : b * N + a;
    const list = edgeMap.get(key);
    if (list) list.push(opp); else edgeMap.set(key, [opp]);
  }
}
const sA: number[] = [], sB: number[] = [], sRest: number[] = [];
const bA: number[] = [], bB: number[] = [], bRest: number[] = [];
for (const [key, opps] of edgeMap) {
  const a = Math.floor(key / N), b = key % N;
  sA.push(a); sB.push(b); sRest.push(restOf(a, b));
  if (opps.length === 2) { bA.push(opps[0]); bB.push(opps[1]); bRest.push(restOf(opps[0], opps[1])); }
}
const pairA: number[] = [], pairB: number[] = [], pairSeam: string[] = [];
for (const sm of pattern.seams) {
  const A = panels[panelIndex[sm.a.panel]].segIdx[sm.a.seg].map((i) => i + base[panelIndex[sm.a.panel]]);
  let B = panels[panelIndex[sm.b.panel]].segIdx[sm.b.seg].map((i) => i + base[panelIndex[sm.b.panel]]);
  if (sm.b.reverse) B = [...B].reverse();
  A.forEach((a, i) => { pairA.push(a); pairB.push(B[i]); pairSeam.push(`${sm.name}#${i}/${A.length - 1}`); });
}
console.log(`constraints: stretch ${sA.length}, bend ${bA.length}, sew ${pairA.length}`);

// ------------------------------------------------------------------ XPBD

const prev = new Float32Array(N * 3);
const vel = new Float32Array(N * 3);
const dt = 1 / (FPS * SUBSTEPS);

function solve(A: number[], B: number[], rest: number[] | null, alpha: number) {
  const at = alpha / (dt * dt);
  for (let c = 0; c < A.length; c++) {
    const i = A[c], j = B[c];
    const wi = invMass[i], wj = invMass[j];
    const w = wi + wj;
    if (w === 0) continue;
    const dx = x[j * 3] - x[i * 3], dy = x[j * 3 + 1] - x[i * 3 + 1], dz = x[j * 3 + 2] - x[i * 3 + 2];
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (d < 1e-9) continue;
    const C = d - (rest ? rest[c] : 0);
    const dl = -C / (w + at);
    const nx = dx / d, ny = dy / d, nz = dz / d;
    x[i * 3] -= wi * dl * nx; x[i * 3 + 1] -= wi * dl * ny; x[i * 3 + 2] -= wi * dl * nz;
    x[j * 3] += wj * dl * nx; x[j * 3 + 1] += wj * dl * ny; x[j * 3 + 2] += wj * dl * nz;
  }
}

function collide(mu: number) {
  const e = 1e-4;
  for (let i = 0; i < N; i++) {
    const px = x[i * 3], py = x[i * 3 + 1], pz = x[i * 3 + 2];
    if (py < -0.45 || py > 0.8 || Math.abs(px) > 0.7 || Math.abs(pz) > 0.4) continue;
    const d = sdf(px, py, pz) - THICK;
    if (d >= 0) continue;
    let gx = sdf(px + e, py, pz) - sdf(px - e, py, pz);
    let gy = sdf(px, py + e, pz) - sdf(px, py - e, pz);
    let gz = sdf(px, py, pz + e) - sdf(px, py, pz - e);
    const gl = Math.hypot(gx, gy, gz) || 1;
    gx /= gl; gy /= gl; gz /= gl;
    let nx = px - gx * d, ny = py - gy * d, nz = pz - gz * d;
    // friction: remove a share of this substep's sliding along the surface
    const mx = nx - prev[i * 3], my = ny - prev[i * 3 + 1], mz = nz - prev[i * 3 + 2];
    const mn = mx * gx + my * gy + mz * gz;
    nx -= (mx - mn * gx) * mu; ny -= (my - mn * gy) * mu; nz -= (mz - mn * gz) * mu;
    x[i * 3] = nx; x[i * 3 + 1] = ny; x[i * 3 + 2] = nz;
  }
}

const smooth = (a: number, b: number, t: number) => { const k = Math.max(0, Math.min(1, (t - a) / (b - a))); return k * k * (3 - 2 * k); };

const recorded: Float32Array[] = [];
const totalFrames = Math.round((RECORD_SECONDS + SETTLE_SECONDS) * FPS);
const t0 = performance.now();
for (let f = 0; f < totalFrames; f++) {
  for (let s = 0; s < SUBSTEPS; s++) {
    const t = (f * SUBSTEPS + s) * dt;
    const g = -9.81 * smooth(0.25, 0.9, t);
    const damp = 1.2 + 10 * smooth(RECORD_SECONDS - 0.6, RECORD_SECONDS + 0.8, t);
    const sewAlpha = 40 * (1 - smooth(0, 0.9, t)) + 1e-7;
    const mu = 0.4 + 0.2 * smooth(0.8, 1.6, t);

    for (let i = 0; i < N; i++) {
      if (invMass[i] === 0) continue;
      vel[i * 3 + 1] += g * dt;
      prev[i * 3] = x[i * 3]; prev[i * 3 + 1] = x[i * 3 + 1]; prev[i * 3 + 2] = x[i * 3 + 2];
      x[i * 3] += vel[i * 3] * dt; x[i * 3 + 1] += vel[i * 3 + 1] * dt; x[i * 3 + 2] += vel[i * 3 + 2] * dt;
    }
    solve(sA, sB, sRest, 0);
    solve(sA, sB, sRest, 0); // a second pass: woven-tight, the jersey must not stretch under its own weight
    solve(bA, bB, bRest, BEND_COMPLIANCE);
    solve(pairA, pairB, null, sewAlpha);
    collide(mu);
    const k = 1 - damp * dt;
    for (let i = 0; i < N * 3; i++) vel[i] = ((x[i] - prev[i]) / dt) * k;
  }
  if (f < RECORD_SECONDS * FPS) recorded.push(Float32Array.from(x));
  if (f % 30 === 0) {
    let gap = 0, worst = "";
    for (let c = 0; c < pairA.length; c++) { const g = Math.hypot(x[pairA[c] * 3] - x[pairB[c] * 3], x[pairA[c] * 3 + 1] - x[pairB[c] * 3 + 1], x[pairA[c] * 3 + 2] - x[pairB[c] * 3 + 2]); if (g > gap) { gap = g; worst = pairSeam[c] + " @" + [x[pairA[c] * 3], x[pairA[c] * 3 + 1], x[pairA[c] * 3 + 2]].map((v) => v.toFixed(3)).join(","); } }
    let ke = 0;
    for (let i = 0; i < N * 3; i++) ke += vel[i] * vel[i];
    let strainMax = 0, strainSum = 0, worstEdge = -1, over10 = 0;
    for (let c = 0; c < sA.length; c++) {
      const e = Math.hypot(x[sB[c] * 3] - x[sA[c] * 3], x[sB[c] * 3 + 1] - x[sA[c] * 3 + 1], x[sB[c] * 3 + 2] - x[sA[c] * 3 + 2]) / sRest[c] - 1;
      strainSum += Math.max(0, e); if (e > strainMax) { strainMax = e; worstEdge = c; } if (e > 0.1) over10++;
    }
    if (process.env.GARMENT_DEBUG && worstEdge >= 0) {
      const a = sA[worstEdge], b = sB[worstEdge];
      const d = (v: number) => `${panels[panelOf[v]].name}(${pat2[v * 2].toFixed(3)},${pat2[v * 2 + 1].toFixed(3)})`;
      console.log(`   worst edge ${d(a)} - ${d(b)} rest ${(sRest[worstEdge] * 100).toFixed(2)}cm, edges >10%: ${over10}`);
    }
    console.log(`t=${(f / FPS).toFixed(2)}s  stretch avg ${((strainSum / sA.length) * 100).toFixed(2)}% max ${(strainMax * 100).toFixed(1)}%  max seam gap ${(gap * 100).toFixed(2)} cm ${worst}  motion ${Math.sqrt(ke / N).toFixed(4)} m/s`);
  }
}
recorded.push(Float32Array.from(x)); // the settled state is the last frame
console.log(`simulated ${totalFrames} frames in ${((performance.now() - t0) / 1000).toFixed(1)} s`);

for (let i = 0; i < N * 3; i++) if (!Number.isFinite(x[i])) throw new Error("simulation diverged (NaN)");

// ------------------------------------------------------------------ texture atlas layout (pattern metres -> atlas pixels)

const ATLAS = 4096, PX_PER_M = 2600;
const rects: Record<string, { ox: number; oy: number; minX: number; maxY: number }> = {};
{
  // 0.06 m (156 px) gutters so each panel's paint bleed never reaches a neighbour
  const place: Record<string, [number, number]> = { front: [96, 96], back: [1760, 96], sleeveR: [96, 2240], sleeveL: [1400, 2240] };
  panels.forEach((p) => {
    let minX = Infinity, maxY = -Infinity;
    for (const [px, py] of p.pos) { minX = Math.min(minX, px); maxY = Math.max(maxY, py); }
    rects[p.name] = { ox: place[p.name][0], oy: place[p.name][1], minX, maxY };
  });
}
const uv = new Float32Array(N * 2);
for (let i = 0; i < N; i++) {
  const r = rects[panels[panelOf[i]].name];
  const cx = r.ox + (pat2[i * 2] - r.minX) * PX_PER_M;
  const cy = r.oy + (r.maxY - pat2[i * 2 + 1]) * PX_PER_M;
  uv[i * 2] = cx / ATLAS; uv[i * 2 + 1] = 1 - cy / ATLAS;
}

// ------------------------------------------------------------------ write

mkdirSync(OUT, { recursive: true });
const frames = new Float32Array(recorded.length * N * 3);
recorded.forEach((r, k) => frames.set(r, k * N * 3));
const pairs = new Uint32Array(pairA.length * 2);
pairA.forEach((a, i) => { pairs[i * 2] = a; pairs[i * 2 + 1] = pairB[i]; });
const write = (name: string, arr: ArrayBufferView) => writeFileSync(`${OUT}/${name}`, Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength));
write("indices.bin", Uint32Array.from(tris));
write("uv.bin", uv);
write("pattern.bin", pat2);
write("panel.bin", panelOf);
write("wrap.bin", wrap);
write("frames.bin", frames);
write("pairs.bin", pairs);
writeFileSync(`${OUT}/jersey.json`, JSON.stringify({
  vertexCount: N,
  triangleCount: tris.length / 3,
  frameCount: recorded.length,
  fps: FPS,
  pairCount: pairA.length,
  panels: panels.map((p, i) => ({ name: p.name, start: base[i], count: p.pos.length, outline: p.loop.map((k) => p.pos[k]) })),
  atlas: { size: ATLAS, pxPerMetre: PX_PER_M, rects },
  dims: pattern.dims,
}, null, 1));
console.log(`wrote ${OUT}: ${N} verts, ${tris.length / 3} tris, ${recorded.length} frames (${(frames.byteLength / 1e6).toFixed(1)} MB)`);
