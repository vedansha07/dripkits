// The jersey mesh. Positions come from the recorded simulation (or any blend the scene asks for);
// seams are welded progressively, and normals are averaged across seams so they shade as one cloth.

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { cancelRender, continueRender, delayRender } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import type { Garment } from "./data";
import type { KitDesign } from "./designs";
import { paintKit, paintKnit } from "./kit";

const anton = loadAnton("normal", { weights: ["400"], subsets: ["latin"] });
const archivo = loadArchivo("normal", { weights: ["900"], subsets: ["latin"] });

/** Paints the kit once fonts are ready; blocks the frame until the texture exists. */
export function useKitTextures(garment: Garment | null, design: KitDesign, opts: { senyera?: boolean } = {}) {
  const [tex, setTex] = useState<{ map: THREE.CanvasTexture; bump: THREE.CanvasTexture } | null>(null);
  const [handle] = useState(() => delayRender("Painting kit"));
  useEffect(() => {
    if (!garment) return;
    Promise.all([anton.waitUntilDone(), archivo.waitUntilDone()])
      .then(() => {
        const map = new THREE.CanvasTexture(paintKit(garment.meta, { number: anton.fontFamily, wordmark: archivo.fontFamily }, design, opts));
        map.colorSpace = THREE.SRGBColorSpace;
        map.anisotropy = 16;
        const bump = new THREE.CanvasTexture(paintKnit(256));
        bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
        // atlas spans size/pxPerMetre metres; one knit tile per 6 mm
        const span = garment.meta.atlas.size / garment.meta.atlas.pxPerMetre;
        bump.repeat.set(span / 0.006, span / 0.006);
        setTex({ map, bump });
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
    // design and opts are fixed for a mounted composition; repainting is a remount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [garment, handle]);
  return tex;
}

export type JerseyProps = {
  garment: Garment;
  /** fills the position buffer for this frame; return value ignored */
  writePositions: (out: Float32Array) => void;
  /** 0 = seams as simulated, 1 = fully welded */
  weld: number;
  map: THREE.Texture;
  bump: THREE.Texture;
};

export function Jersey({ garment, writePositions, weld, map, bump }: JerseyProps) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(garment.meta.vertexCount * 3), 3));
    g.setAttribute("uv", new THREE.BufferAttribute(garment.uv, 2));
    g.setIndex(new THREE.BufferAttribute(garment.indices, 1));
    return g;
  }, [garment]);

  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      map,
      bumpMap: bump,
      bumpScale: 0.35,
      roughness: 0.58,
      metalness: 0,
      sheen: 0.5,
      sheenRoughness: 0.45,
      sheenColor: new THREE.Color("#ffffff"),
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
    });
    // the inside of a garment is in its own shade: darken back faces, as in a ghost-mannequin shot
    m.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        `if (!gl_FrontFacing) outgoingLight *= 0.42;
#include <opaque_fragment>`,
      );
    };
    m.customProgramCacheKey = () => "jersey-inside-shade";
    return m;
  }, [map, bump]);

  // runs during render: Remotion renders one frame per React render, so this is frame-driven
  const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
  const arr = pos.array as Float32Array;
  writePositions(arr);
  const pairs = garment.pairs;
  if (weld > 0) {
    for (let p = 0; p < pairs.length; p += 2) {
      const a = pairs[p] * 3, b = pairs[p + 1] * 3;
      for (let c = 0; c < 3; c++) {
        const m = (arr[a + c] + arr[b + c]) / 2;
        arr[a + c] += (m - arr[a + c]) * weld;
        arr[b + c] += (m - arr[b + c]) * weld;
      }
    }
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
  if (weld > 0.5) {
    const n = geometry.getAttribute("normal") as THREE.BufferAttribute;
    const na = n.array as Float32Array;
    for (let p = 0; p < pairs.length; p += 2) {
      const a = pairs[p] * 3, b = pairs[p + 1] * 3;
      let x = na[a] + na[b], y = na[a + 1] + na[b + 1], z = na[a + 2] + na[b + 2];
      const l = Math.hypot(x, y, z) || 1;
      x /= l; y /= l; z /= l;
      na[a] = na[b] = x; na[a + 1] = na[b + 1] = y; na[a + 2] = na[b + 2] = z;
    }
    n.needsUpdate = true;
  }
  geometry.computeBoundingSphere();

  return <mesh geometry={geometry} material={material} castShadow receiveShadow />;
}

/** Linear blend of two recorded sim frames, fractional index allowed. */
export function simFrame(garment: Garment, f: number, out: Float32Array) {
  const n = garment.meta.vertexCount * 3;
  const max = garment.meta.frameCount - 1;
  const fi = Math.max(0, Math.min(max, f));
  const i0 = Math.floor(fi), i1 = Math.min(max, i0 + 1), t = fi - i0;
  const A = garment.frames.subarray(i0 * n, i0 * n + n), B = garment.frames.subarray(i1 * n, i1 * n + n);
  for (let i = 0; i < n; i++) out[i] = A[i] + (B[i] - A[i]) * t;
}
