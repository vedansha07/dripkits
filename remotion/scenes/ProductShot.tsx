// Catalogue photography: the settled garment in a product's colourway, transparent background.
// Three views per product: front three-quarter (card image), back (card hover), chest detail.
// Rendered in batch by scripts/products/render.mts.

import { AbsoluteFill, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { useGarment } from "../jersey/data";
import { DESIGNS } from "../jersey/designs";
import { Jersey, simFrame, useKitTextures } from "../jersey/Jersey";
import { SoftShadow } from "../jersey/SoftShadow";
import { StudioLights } from "../jersey/Studio";

export type ShotView = "front" | "back" | "detail";

const VIEW: Record<ShotView, { turn: number; cam: [number, number, number]; look: [number, number, number]; shadow: number }> = {
  front: { turn: -0.38, cam: [0, 0.02, 2.62], look: [0, 0.0, 0], shadow: 0.42 },
  back: { turn: Math.PI + 0.12, cam: [0, 0.02, 2.62], look: [0, 0.0, 0], shadow: 0.42 },
  detail: { turn: -0.22, cam: [0.05, 0.2, 1.05], look: [0.04, 0.17, 0], shadow: 0 },
};

export const ProductShot = ({ design, view }: { design: string; view: ShotView }) => {
  const { width, height } = useVideoConfig();
  const garment = useGarment();
  const tex = useKitTextures(garment, DESIGNS[design] ?? DESIGNS.hero, { senyera: design.startsWith("barcelona") });
  const v = VIEW[view];
  const last = garment ? garment.meta.frameCount - 1 : 0;

  return (
    <AbsoluteFill>
      {garment && tex ? (
        <ThreeCanvas width={width} height={height} shadows camera={{ fov: 26, position: v.cam }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true, premultipliedAlpha: false }}>
          <Aim cam={v.cam} look={v.look} />
          <StudioLights shadowOpacity={0} />
          <SoftShadow y={-0.5} opacity={v.shadow} />
          <group position={[0, -0.18, 0]} rotation-y={v.turn}>
            <Jersey garment={garment} writePositions={(out) => simFrame(garment, last, out)} weld={1} map={tex.map} bump={tex.bump} />
          </group>
        </ThreeCanvas>
      ) : null}
    </AbsoluteFill>
  );
};

function Aim({ cam, look }: { cam: [number, number, number]; look: [number, number, number] }) {
  const camera = useThree((s) => s.camera);
  camera.position.set(...cam);
  camera.lookAt(...look);
  camera.updateMatrixWorld();
  return null;
}
