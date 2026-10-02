// Debug only: draws the simulator's collision body from the same primitive list.
import { useMemo } from "react";
import * as THREE from "three";
import { PRIMS, PROFILE, profileAt } from "../../scripts/garment/mannequin";

function torsoGeometry() {
  const rings = 48, seg = 48;
  const y0 = PROFILE[0][0], y1 = PROFILE[PROFILE.length - 1][0];
  const pos: number[] = [], idx: number[] = [];
  for (let r = 0; r <= rings; r++) {
    const y = y0 + ((y1 - y0) * r) / rings;
    const [rx, rz, zc] = profileAt(y);
    for (let s = 0; s <= seg; s++) {
      const t = (s / seg) * Math.PI * 2;
      pos.push(rx * Math.sin(t), y, zc + rz * Math.cos(t));
    }
  }
  for (let r = 0; r < rings; r++) for (let s = 0; s < seg; s++) {
    const a = r * (seg + 1) + s, b = a + seg + 1;
    idx.push(a, a + 1, b, a + 1, b + 1, b);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function Mannequin({ opacity = 1 }: { opacity?: number }) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c9ccd3", roughness: 0.7, transparent: opacity < 1, opacity, side: THREE.DoubleSide }), [opacity]);
  const torso = useMemo(() => torsoGeometry(), []);
  return (
    <group>
      <mesh geometry={torso} material={mat} />
      {PRIMS.map((p, i) => {
        if (p.kind === "sphere") return <mesh key={i} position={p.c} material={mat}><sphereGeometry args={[p.r, 32, 16]} /></mesh>;
        const a = new THREE.Vector3(...p.a), b = new THREE.Vector3(...p.b);
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const len = a.distanceTo(b);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
        return (
          <group key={i}>
            <mesh position={mid} quaternion={q} material={mat}><cylinderGeometry args={[p.rb, p.ra, len, 32]} /></mesh>
            <mesh position={a} material={mat}><sphereGeometry args={[p.ra, 32, 16]} /></mesh>
            <mesh position={b} material={mat}><sphereGeometry args={[p.rb, 32, 16]} /></mesh>
          </group>
        );
      })}
    </group>
  );
}
