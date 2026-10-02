// The invisible mannequin the jersey is sewn onto: an A-pose male torso, size M, as a signed
// distance field: a lofted elliptic torso smooth-unioned with round cones and spheres for the
// neck, trapezius, deltoids and arms. Shared by the simulator (collisions) and the Remotion
// debug view (drawn from the same primitive list).

export type V3 = [number, number, number];

const ARM_DEG = 45;
const sinA = Math.sin((ARM_DEG * Math.PI) / 180), cosA = Math.cos((ARM_DEG * Math.PI) / 180);
export const ARM_LEN = 0.34;
export const ARMS = [1, -1].map((s) => ({
  side: s,
  joint: [0.2 * s, 0.43, 0] as V3,
  dir: [sinA * s, -cosA, 0] as V3, // down and out
  up: [cosA * s, sinA, 0] as V3, // perpendicular, pointing up and out
}));

// y, half width, half depth, forward offset of the ellipse centre
export const PROFILE: Array<[number, number, number, number]> = [
  [-0.34, 0.172, 0.112, 0],
  [-0.1, 0.165, 0.105, 0],
  [0.08, 0.158, 0.102, 0],
  [0.25, 0.168, 0.118, 0.01],
  [0.36, 0.178, 0.116, 0.008],
  [0.44, 0.17, 0.104, 0.002],
  [0.5, 0.125, 0.084, -0.006],
  [0.53, 0.075, 0.062, -0.01],
];

export type Prim =
  | { kind: "cone"; a: V3; b: V3; ra: number; rb: number; k: number }
  | { kind: "sphere"; c: V3; r: number; k: number };

export const PRIMS: Prim[] = [
  { kind: "cone", a: [0, 0.46, -0.012], b: [0, 0.74, -0.02], ra: 0.06, rb: 0.058, k: 0.04 }, // neck
  ...ARMS.flatMap((arm): Prim[] => {
    const s = arm.side;
    const end: V3 = [arm.joint[0] + arm.dir[0] * ARM_LEN, arm.joint[1] + arm.dir[1] * ARM_LEN, 0];
    return [
      { kind: "cone", a: [0.05 * s, 0.505, -0.012], b: [0.185 * s, 0.47, -0.008], ra: 0.058, rb: 0.055, k: 0.035 }, // trapezius
      { kind: "sphere", c: [0.195 * s, 0.435, 0], r: 0.055, k: 0.03 }, // deltoid
      { kind: "cone", a: arm.joint, b: end, ra: 0.052, rb: 0.042, k: 0.03 }, // upper arm
    ];
  }),
];

export function profileAt(y: number): [number, number, number] {
  if (y <= PROFILE[0][0]) return [PROFILE[0][1], PROFILE[0][2], PROFILE[0][3]];
  for (let i = 1; i < PROFILE.length; i++) {
    if (y <= PROFILE[i][0]) {
      const [y0, a0, b0, c0] = PROFILE[i - 1], [y1, a1, b1, c1] = PROFILE[i];
      const t = (y - y0) / (y1 - y0);
      return [a0 + (a1 - a0) * t, b0 + (b1 - b0) * t, c0 + (c1 - c0) * t];
    }
  }
  const l = PROFILE[PROFILE.length - 1];
  return [l[1], l[2], l[3]];
}

function sdTorso(x: number, y: number, z: number) {
  const [rx, rz, zc] = profileAt(y);
  const ex = x / rx, ez = (z - zc) / rz;
  const k0 = Math.hypot(ex, ez), k1 = Math.hypot(x / (rx * rx), (z - zc) / (rz * rz));
  const d2 = k1 > 1e-9 ? (k0 * (k0 - 1)) / k1 : -Math.min(rx, rz);
  const dy = Math.max(PROFILE[0][0] - y, y - PROFILE[PROFILE.length - 1][0]);
  return Math.min(Math.max(d2, dy), 0) + Math.hypot(Math.max(d2, 0), Math.max(dy, 0));
}

/** Round cone: capsule whose radius goes linearly from ra at a to rb at b. */
function sdCone(px: number, py: number, pz: number, a: V3, b: V3, ra: number, rb: number) {
  const bx = b[0] - a[0], by = b[1] - a[1], bz = b[2] - a[2];
  const qx = px - a[0], qy = py - a[1], qz = pz - a[2];
  const t = Math.max(0, Math.min(1, (qx * bx + qy * by + qz * bz) / (bx * bx + by * by + bz * bz)));
  return Math.hypot(qx - bx * t, qy - by * t, qz - bz * t) - (ra + (rb - ra) * t);
}

function smin(a: number, b: number, k: number) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

export function sdf(x: number, y: number, z: number) {
  let d = sdTorso(x, y, z);
  for (const p of PRIMS) {
    const dp = p.kind === "cone" ? sdCone(x, y, z, p.a, p.b, p.ra, p.rb) : Math.hypot(x - p.c[0], y - p.c[1], z - p.c[2]) - p.r;
    d = smin(d, dp, p.k);
  }
  return d;
}

/** Where the simulator rolls the flat pieces before sewing: body panels on an elliptic cylinder,
 *  sleeves into tubes starting this far down the arm. Shared with the Remotion animation. */
export const WRAP = { ellA: 0.218, ellB: 0.146, sleeveS0: 0.02 };
