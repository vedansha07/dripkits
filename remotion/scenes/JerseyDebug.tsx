// Debug: the garment on its mannequin at several simulation moments, front and side.
// Frame f -> moment MOMENTS[f >> 1], angle (f & 1 ? side : front).
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useGarment } from "../jersey/data";
import { DESIGNS } from "../jersey/designs";
import { Jersey, simFrame, useKitTextures } from "../jersey/Jersey";
import { Mannequin } from "../jersey/Mannequin";
import { StudioLights } from "../jersey/Studio";

const MOMENTS = [0.12, 0.22, 0.35, 1]; // fraction of the recorded simulation

export const JerseyDebug = ({ showBody }: { showBody: boolean }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const garment = useGarment();
  const tex = useKitTextures(garment, DESIGNS.hero, { senyera: true });
  const moment = MOMENTS[Math.min(MOMENTS.length - 1, frame >> 1)];
  const side = frame & 1;
  const f = garment ? moment * (garment.meta.frameCount - 1) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#E8EBF0" }}>
      {garment && tex ? (
        <ThreeCanvas width={width} height={height} shadows camera={{ fov: 26, position: [0, 0.05, 2.75] }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
          <StudioLights shadowOpacity={0} />
          <group rotation-y={side ? Math.PI / 2 : 0} position={[0, -0.2, 0]}>
            {showBody ? <Mannequin /> : null}
            <Jersey garment={garment} writePositions={(out) => simFrame(garment, f, out)} weld={moment === 1 ? 1 : 0} map={tex.map} bump={tex.bump} />
          </group>
        </ThreeCanvas>
      ) : null}
      <div style={{ position: "absolute", left: 24, top: 18, font: "600 28px Arial", color: "#333" }}>
        sim {Math.round(moment * 100)}% · {side ? "side" : "front"}
      </div>
    </AbsoluteFill>
  );
};
