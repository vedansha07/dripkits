// Exports the simulated jersey for the site (pnpm garment:web, after pnpm garment):
//   public/models/jersey.glb        the settled, seam-welded garment. A plain glTF, so his real
//                                    model can replace it later without code changes.
//   public/models/jersey-build.json  the sewing intro plan: per panel layout and flight frames
//   public/models/jersey-build.bin.gz the intro's per-vertex data, int16, keyframes delta coded
//
// The intro is the HeroBuild choreography (remotion/scenes/HeroBuild.tsx) played in real time:
// flat pieces fly in, curl around the body, then a handful of simulation keyframes sew and drape it.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import * as THREE from "three";
import { ARMS, WRAP } from "./mannequin";

const SRC = "remotion/public/garment";
const OUT = "public/models";

// sim frames kept for the sewing phase; the last one is replaced by the welded settled shape
const KEYFRAMES = [0, 6, 12, 20, 30, 44, 62, 90, 130, 192];

type Meta = {
  vertexCount: number;
  frameCount: number;
  panels: Array<{ name: string; start: number; count: number }>;
  dims: { capH: number; sleeveW: number };
};

const meta = JSON.parse(readFileSync(join(SRC, "jersey.json"), "utf8")) as Meta;
const read = (name: string) => {
  const b = readFileSync(join(SRC, name));
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
};
const N = meta.vertexCount;
const indices32 = new Uint32Array(read("indices.bin"));
const uv = new Float32Array(read("uv.bin"));
const pattern = new Float32Array(read("pattern.bin"));
const wrap = new Float32Array(read("wrap.bin"));
const frames = new Float32Array(read("frames.bin"));
const pairs = new Uint32Array(read("pairs.bin"));

const frameAt = (f: number) => frames.slice(f * N * 3, (f + 1) * N * 3);

// settled shape, seams welded
const settled = frameAt(meta.frameCount - 1);
for (let p = 0; p < pairs.length; p += 2) {
  const a = pairs[p] * 3, b = pairs[p + 1] * 3;
  for (let c = 0; c < 3; c++) settled[a + c] = settled[b + c] = (settled[a + c] + settled[b + c]) / 2;
}

// centre the model on its bounding box; every position set below shares this offset
const box = new THREE.Box3().setFromArray(settled);
const centre = box.getCenter(new THREE.Vector3());
const size = box.getSize(new THREE.Vector3());
const recentre = (a: Float32Array) => {
  for (let i = 0; i < a.length; i += 3) { a[i] -= centre.x; a[i + 1] -= centre.y; a[i + 2] -= centre.z; }
  return a;
};
recentre(settled);

// normals, averaged across seams so the welded cloth shades as one piece
const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.BufferAttribute(settled, 3));
geo.setIndex(new THREE.BufferAttribute(indices32, 1));
geo.computeVertexNormals();
const normals = geo.getAttribute("normal").array as Float32Array;
for (let p = 0; p < pairs.length; p += 2) {
  const a = pairs[p] * 3, b = pairs[p + 1] * 3;
  const v = new THREE.Vector3(normals[a] + normals[b], normals[a + 1] + normals[b + 1], normals[a + 2] + normals[b + 2]).normalize();
  normals[a] = normals[b] = v.x; normals[a + 1] = normals[b + 1] = v.y; normals[a + 2] = normals[b + 2] = v.z;
}

// glTF texture space has v pointing down; the kit atlas is loaded with flipY false to match
const uvGl = new Float32Array(uv.length);
for (let i = 0; i < uv.length; i += 2) { uvGl[i] = uv[i]; uvGl[i + 1] = 1 - uv[i + 1]; }

// ---- intro plan (ported from HeroBuild.plan) ----

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const frameQuat = (U: THREE.Vector3, Vv: THREE.Vector3) =>
  new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(U, Vv, U.clone().cross(Vv)));

const LAYOUT: Record<string, { c: [number, number, number]; mirror: boolean; tilt: [number, number, number]; delay: number; curl: [number, number] }> = {
  front: { c: [-0.31, 0.27, 0], mirror: false, tilt: [-0.18, 0.12, 0.05], delay: 0, curl: [44, 74] },
  back: { c: [0.31, 0.27, 0.02], mirror: true, tilt: [-0.18, -0.12, -0.04], delay: 5, curl: [46, 74] },
  sleeveL: { c: [-0.36, -0.33, 0.05], mirror: false, tilt: [-0.3, 0.1, 0.12], delay: 10, curl: [26, 60] },
  sleeveR: { c: [0.36, -0.33, 0.05], mirror: true, tilt: [-0.3, -0.1, -0.12], delay: 13, curl: [29, 63] },
};

// HeroBuild drew the layout in a group lowered by 0.18; keep that framing relative to the new origin
const layoutShift = V(0, -0.18, 0).sub(centre);

const prewrap = new Float32Array(N * 3);
const R = meta.dims.sleeveW / (2 * Math.PI);
const panels = meta.panels.map((p) => {
  let cu = 0, cv = 0;
  for (let i = p.start; i < p.start + p.count; i++) { cu += pattern[i * 2]; cv += pattern[i * 2 + 1]; }
  cu /= p.count; cv /= p.count;

  let toPre: (u: number, v: number) => THREE.Vector3;
  let UP: THREE.Vector3, VP: THREE.Vector3;
  if (p.name === "front" || p.name === "back") {
    const z = p.name === "front" ? WRAP.ellB : -WRAP.ellB;
    toPre = (u, v) => V(u, v, z);
    UP = V(1, 0, 0); VP = V(0, 1, 0);
  } else {
    const arm = ARMS[p.name === "sleeveR" ? 0 : 1];
    const J = V(...arm.joint), a = V(...arm.dir), up = V(...arm.up);
    toPre = (u, v) => J.clone().addScaledVector(a, WRAP.sleeveS0 + meta.dims.capH - v).addScaledVector(up, R).add(V(0, 0, u));
    UP = V(0, 0, 1); VP = a.clone().negate();
  }
  for (let i = p.start; i < p.start + p.count; i++) {
    const q = toPre(pattern[i * 2], pattern[i * 2 + 1]).sub(centre);
    prewrap[i * 3] = q.x; prewrap[i * 3 + 1] = q.y; prewrap[i * 3 + 2] = q.z;
  }

  const L = LAYOUT[p.name];
  const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(...L.tilt));
  const qL = frameQuat(V(L.mirror ? -1 : 1, 0, 0).applyQuaternion(tilt), V(0, 1, 0).applyQuaternion(tilt));
  const qP = frameQuat(UP, VP);
  const cL = V(...L.c).add(layoutShift);
  const cP = toPre(cu, cv).sub(centre);
  return {
    name: p.name, start: p.start, count: p.count, cu, cv,
    qL: qL.toArray(), qP: qP.toArray(), cL: cL.toArray(), cP: cP.toArray(),
    delay: L.delay, curl: L.curl,
  };
});

recentre(wrap);
const keys = KEYFRAMES.map((f, i) => (i === KEYFRAMES.length - 1 ? settled : recentre(frameAt(Math.min(f, meta.frameCount - 1)))));

// ---- quantise: one range for every 3D set, one for the flat pattern ----
const all3 = [prewrap, wrap, ...keys];
let lo = Infinity, hi = -Infinity;
for (const a of all3) for (let i = 0; i < a.length; i++) { lo = Math.min(lo, a[i]); hi = Math.max(hi, a[i]); }
let plo = Infinity, phi = -Infinity;
for (let i = 0; i < pattern.length; i++) { plo = Math.min(plo, pattern[i]); phi = Math.max(phi, pattern[i]); }
const q16 = (a: Float32Array, min: number, max: number) => {
  const out = new Int16Array(a.length);
  const s = 65534 / (max - min);
  for (let i = 0; i < a.length; i++) out[i] = Math.round((a[i] - min) * s) - 32767;
  return out;
};
const qPattern = q16(pattern, plo, phi);
const qPre = q16(prewrap, lo, hi);
const qWrap = q16(wrap, lo, hi);
// keyframes as deltas from the previous one (from wrap for the first): small numbers, gzip well
const qKeys = keys.map((k) => q16(k, lo, hi));
const dKeys = qKeys.map((k, i) => {
  const prev = i === 0 ? qWrap : qKeys[i - 1];
  const d = new Int16Array(k.length);
  for (let j = 0; j < k.length; j++) d[j] = k[j] - prev[j];
  return d;
});
const parts = [qPattern, qPre, qWrap, ...dKeys];
const count = parts.reduce((n, p) => n + p.length, 0);
const total = count * 2;
// byte planes: every low byte, then every high byte. The high bytes of small deltas are nearly all
// 0 or 255, which gzip folds away; interleaved they would not compress.
const bin = new Uint8Array(total);
let o = 0;
for (const p of parts) for (let i = 0; i < p.length; i++, o++) { bin[o] = p[i] & 0xff; bin[count + o] = (p[i] >> 8) & 0xff; }

// ---- GLB ----
function glb(positions: Float32Array, norms: Float32Array, uvs: Float32Array, index: Uint16Array) {
  const views: object[] = [];
  const chunks: Uint8Array[] = [];
  let offset = 0;
  const add = (a: ArrayBufferView, target: number) => {
    const bytes = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
    const pad = (4 - (bytes.byteLength % 4)) % 4;
    views.push({ buffer: 0, byteOffset: offset, byteLength: bytes.byteLength, target });
    chunks.push(bytes, new Uint8Array(pad));
    offset += bytes.byteLength + pad;
    return views.length - 1;
  };
  const pb = new THREE.Box3().setFromArray(positions);
  const json = {
    asset: { version: "2.0", generator: "dripkits scripts/garment/export-web.ts" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: "jersey" }],
    meshes: [{ name: "jersey", primitives: [{ attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 }, indices: 3, material: 0 }] }],
    materials: [{ name: "kit", doubleSided: true, pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 0.58 } }],
    accessors: [
      { bufferView: add(positions, 34962), componentType: 5126, count: N, type: "VEC3", min: pb.min.toArray(), max: pb.max.toArray() },
      { bufferView: add(norms, 34962), componentType: 5126, count: N, type: "VEC3" },
      { bufferView: add(uvs, 34962), componentType: 5126, count: N, type: "VEC2" },
      { bufferView: add(index, 34963), componentType: 5123, count: index.length, type: "SCALAR" },
    ],
    bufferViews: views,
    buffers: [{ byteLength: offset }],
  };
  let text = JSON.stringify(json);
  while (text.length % 4) text += " ";
  const jsonBytes = new TextEncoder().encode(text);
  const length = 12 + 8 + jsonBytes.byteLength + 8 + offset;
  const out = new Uint8Array(length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, 0x46546c67, true); // "glTF"
  dv.setUint32(4, 2, true);
  dv.setUint32(8, length, true);
  dv.setUint32(12, jsonBytes.byteLength, true);
  dv.setUint32(16, 0x4e4f534a, true); // "JSON"
  out.set(jsonBytes, 20);
  let p = 20 + jsonBytes.byteLength;
  dv.setUint32(p, offset, true);
  dv.setUint32(p + 4, 0x004e4942, true); // "BIN\0"
  p += 8;
  for (const c of chunks) { out.set(c, p); p += c.byteLength; }
  return out;
}

mkdirSync(OUT, { recursive: true });
const model = glb(settled, normals, uvGl, Uint16Array.from(indices32));
writeFileSync(join(OUT, "jersey.glb"), model);
const gz = gzipSync(bin, { level: 9 });
writeFileSync(join(OUT, "jersey-build.bin.gz"), gz);
writeFileSync(
  join(OUT, "jersey-build.json"),
  JSON.stringify({
    vertexCount: N,
    size: size.toArray(),
    range: [lo, hi],
    patternRange: [plo, phi],
    keyframes: KEYFRAMES,
    simFps: 60,
    panels,
  }),
);

console.log(`jersey.glb ${(model.byteLength / 1024).toFixed(0)} KB, size ${size.toArray().map((v) => v.toFixed(3)).join(" x ")} m`);
console.log(`jersey-build.bin.gz ${(gz.byteLength / 1024).toFixed(0)} KB (raw ${(total / 1024).toFixed(0)} KB), ${KEYFRAMES.length} keyframes`);
