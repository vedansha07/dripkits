// A soft elliptical product shadow. The jersey is hollow, so a contact shadow sees its hem as a
// ring and renders two blobs; a studio shot has one soft pool under the garment instead.
import { useMemo } from "react";
import * as THREE from "three";

export function SoftShadow({ y, width = 0.8, depth = 0.3, opacity }: { y: number; width?: number; depth?: number; opacity: number }) {
  const map = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(20,24,40,0.85)");
    g.addColorStop(0.45, "rgba(20,24,40,0.42)");
    g.addColorStop(1, "rgba(20,24,40,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  if (opacity <= 0) return null;
  return (
    <mesh position={[0, y, 0]} rotation-x={-Math.PI / 2} renderOrder={-1}>
      <planeGeometry args={[width, depth]} />
      <meshBasicMaterial map={map} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}
