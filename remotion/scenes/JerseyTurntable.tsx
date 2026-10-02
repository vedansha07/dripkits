// Inspection view: the settled garment from four angles, one per frame (render --frames=0,1,2,3).
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useGarment } from "../jersey/data";
import { DESIGNS } from "../jersey/designs";
import { Jersey, simFrame, useKitTextures } from "../jersey/Jersey";
import { StudioLights } from "../jersey/Studio";

const ANGLES = [0, Math.PI, Math.PI / 2, -0.62];

export const JerseyTurntable = ({ background }: { background: string }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const garment = useGarment();
  const tex = useKitTextures(garment, DESIGNS.hero, { senyera: true });
  const last = garment ? garment.meta.frameCount - 1 : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: background }}>
      {garment && tex ? (
        <ThreeCanvas width={width} height={height} shadows camera={{ fov: 26, position: [0, 0.05, 2.75] }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
          <StudioLights />
          <group rotation-y={ANGLES[frame % ANGLES.length]} position={[0, -0.2, 0]}>
            <Jersey garment={garment} writePositions={(out) => simFrame(garment, last, out)} weld={1} map={tex.map} bump={tex.bump} />
          </group>
        </ThreeCanvas>
      ) : null}
    </AbsoluteFill>
  );
};
