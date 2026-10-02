// The hero sequence: a jersey sewn into existence. Rendered to a transparent frame sequence and
// scrubbed by scroll on the site. Start frame: the four flat pattern pieces, print side up.
// End frame: the finished jersey at a three-quarter hero angle.
//
//   0-12    hold the flat layout
//   12-62   each piece flies in with a real 3D turn (quaternion slerp; the back panel turns over)
//   44-76   the pieces curl around the invisible body
//   74-124  the recorded simulation sews the seams shut and lets it drape
//   112-149 seams weld, it settles, turns to three-quarter, camera closes in

import { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { ARMS, WRAP } from "../../scripts/garment/mannequin";
import { type Garment, useGarment } from "../jersey/data";
import { DESIGNS } from "../jersey/designs";
import { Jersey, simFrame, useKitTextures } from "../jersey/Jersey";
import { SoftShadow } from "../jersey/SoftShadow";
import { StudioLights } from "../jersey/Studio";

const ease = Easing.bezier(0.65, 0, 0.35, 1);
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type PanelPlan = {
  start: number;
  count: number;
  cu: number; // pattern centroid
  cv: number;
  qL: THREE.Quaternion; // layout orientation
  qP: THREE.Quaternion; // orientation as a flat sheet tangent to its wrapped place
  cL: THREE.Vector3; // layout centroid
  cP: THREE.Vector3; // pre-wrap centroid
  delay: number; // frames
  curl: [number, number];
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const frameQuat = (U: THREE.Vector3, Vv: THREE.Vector3) => {
  const W = U.clone().cross(Vv);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(U, Vv, W));
};

// Flat layout, tech-pack style. A panel is mirrored when its printed side is the pattern's back
// face once wrapped (back panel, right sleeve), so the print faces the camera here too.
// curl: frames over which the flat sheet rolls into its wrapped shape. Sleeves roll while they
// fly so they arrive as tubes instead of passing edge-on to the camera.
const LAYOUT: Record<string, { c: [number, number, number]; mirror: boolean; tilt: [number, number, number]; delay: number; curl: [number, number] }> = {
  front: { c: [-0.31, 0.27, 0], mirror: false, tilt: [-0.18, 0.12, 0.05], delay: 0, curl: [44, 74] },
  back: { c: [0.31, 0.27, 0.02], mirror: true, tilt: [-0.18, -0.12, -0.04], delay: 5, curl: [46, 74] },
  sleeveL: { c: [-0.36, -0.33, 0.05], mirror: false, tilt: [-0.3, 0.1, 0.12], delay: 10, curl: [26, 60] },
  sleeveR: { c: [0.36, -0.33, 0.05], mirror: true, tilt: [-0.3, -0.1, -0.12], delay: 13, curl: [29, 63] },
};

function plan(g: Garment): { panels: PanelPlan[]; prewrap: Float32Array } {
  const N = g.meta.vertexCount;
  const prewrap = new Float32Array(N * 3);
  const capH = g.meta.dims.capH;
  const R = g.meta.dims.sleeveW / (2 * Math.PI);

  const panels = g.meta.panels.map((p) => {
    let cu = 0, cv = 0;
    for (let i = p.start; i < p.start + p.count; i++) { cu += g.pattern[i * 2]; cv += g.pattern[i * 2 + 1]; }
    cu /= p.count; cv /= p.count;

    // where each pattern point sits on the flat sheet tangent to its wrapped place
    let toPre: (u: number, v: number) => THREE.Vector3;
    let UP: THREE.Vector3, VP: THREE.Vector3;
    if (p.name === "front" || p.name === "back") {
      const z = p.name === "front" ? WRAP.ellB : -WRAP.ellB;
      toPre = (u, v) => V(u, v, z);
      UP = V(1, 0, 0); VP = V(0, 1, 0);
    } else {
      const arm = ARMS[p.name === "sleeveR" ? 0 : 1];
      const J = V(...arm.joint), a = V(...arm.dir), up = V(...arm.up);
      toPre = (u, v) => J.clone().addScaledVector(a, WRAP.sleeveS0 + capH - v).addScaledVector(up, R).add(V(0, 0, u));
      UP = V(0, 0, 1); VP = a.clone().negate();
    }
    for (let i = p.start; i < p.start + p.count; i++) {
      const q = toPre(g.pattern[i * 2], g.pattern[i * 2 + 1]);
      prewrap[i * 3] = q.x; prewrap[i * 3 + 1] = q.y; prewrap[i * 3 + 2] = q.z;
    }

    const L = LAYOUT[p.name];
    const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(...L.tilt));
    const UL = V(L.mirror ? -1 : 1, 0, 0).applyQuaternion(tilt);
    const VL = V(0, 1, 0).applyQuaternion(tilt);
    return {
      start: p.start,
      count: p.count,
      cu, cv,
      qL: frameQuat(UL, VL),
      qP: frameQuat(UP, VP),
      cL: V(...L.c),
      cP: toPre(cu, cv),
      delay: L.delay,
      curl: L.curl,
    } satisfies PanelPlan;
  });
  return { panels, prewrap };
}

export const HeroBuild = ({ background }: { background: string }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const garment = useGarment();
  const tex = useKitTextures(garment, DESIGNS.hero, { senyera: true });
  const p = useMemo(() => (garment ? plan(garment) : null), [garment]);

  // the camera closes in as the garment comes together
  const camZ = interpolate(frame, [0, 70, 149], [3.95, 3.1, 2.62], { ...clamp, easing: ease });
  const camY = interpolate(frame, [0, 149], [0.02, -0.01], clamp);
  const turn = interpolate(frame, [116, 149], [0, -0.4], { ...clamp, easing: easeOut });
  const weld = interpolate(frame, [110, 124], [0, 1], clamp);
  const shadow = interpolate(frame, [96, 140], [0, 0.55], clamp);

  const write = (out: Float32Array) => {
    if (!garment || !p) return;
    if (frame >= 74) {
      // sewing and drape: recorded simulation, fast at first then easing into rest
      const last = garment.meta.frameCount - 1;
      const f = interpolate(frame, [74, 124, 149], [0, 112, last], { ...clamp, easing: [Easing.bezier(0.3, 0.1, 0.4, 1), easeOut] });
      simFrame(garment, f, out);
      return;
    }
    const q = new THREE.Quaternion();
    const d = new THREE.Vector3();
    for (const pl of p.panels) {
      const tFly = interpolate(frame, [12 + pl.delay, 50 + pl.delay], [0, 1], { ...clamp, easing: ease });
      const tCurl = interpolate(frame, pl.curl, [0, 1], { ...clamp, easing: ease });
      q.slerpQuaternions(pl.qL, pl.qP, tFly);
      const arc = Math.sin(Math.PI * tFly) * 0.22; // swing toward the camera mid-flight
      const cx = pl.cL.x + (pl.cP.x - pl.cL.x) * tFly;
      const cy = pl.cL.y + (pl.cP.y - pl.cL.y) * tFly;
      const cz = pl.cL.z + (pl.cP.z - pl.cL.z) * tFly + arc;
      for (let i = pl.start; i < pl.start + pl.count; i++) {
        d.set(garment.pattern[i * 2] - pl.cu, garment.pattern[i * 2 + 1] - pl.cv, 0).applyQuaternion(q);
        let x = cx + d.x, y = cy + d.y, z = cz + d.z;
        if (tCurl > 0) {
          x += (garment.wrap[i * 3] - p.prewrap[i * 3]) * tCurl;
          y += (garment.wrap[i * 3 + 1] - p.prewrap[i * 3 + 1]) * tCurl;
          z += (garment.wrap[i * 3 + 2] - p.prewrap[i * 3 + 2]) * tCurl;
        }
        out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = z;
      }
    }
  };

  return (
    <AbsoluteFill style={{ backgroundColor: background }}>
      {garment && tex && p ? (
        <ThreeCanvas
          width={width}
          height={height}
          shadows
          camera={{ fov: 26, position: [0, camY, camZ] }}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true, premultipliedAlpha: false }}
        >
          <CameraRig z={camZ} y={camY} />
          <StudioLights shadowOpacity={0} />
          <SoftShadow y={-0.5} opacity={shadow} />
          <group position={[0, -0.18, 0]} rotation-y={turn}>
            <Jersey garment={garment} writePositions={write} weld={weld} map={tex.map} bump={tex.bump} />
          </group>
        </ThreeCanvas>
      ) : null}
    </AbsoluteFill>
  );
};

/** Keeps the default camera on the frame-driven dolly path (the canvas prop only sets it once). */
function CameraRig({ z, y }: { z: number; y: number }) {
  const camera = useThree((s) => s.camera);
  camera.position.set(0, y, z);
  camera.lookAt(0, y * 0.5, 0);
  camera.updateMatrixWorld();
  return null;
}
