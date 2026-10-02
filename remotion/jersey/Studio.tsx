// A product-photography lighting rig: softboxes as environment lightformers (reflections and
// soft fill), one shadow-casting key for self-shadowing in the folds, and a contact shadow.

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";

export function StudioLights({ shadowOpacity = 0.42, floorY = -0.62 }: { shadowOpacity?: number; floorY?: number }) {
  return (
    <>
      <Environment resolution={512} frames={1}>
        {/* big overhead softbox, front-tilted */}
        <Lightformer form="rect" intensity={2.4} position={[0, 2.6, 1.6]} rotation-x={-Math.PI / 2.6} scale={[4.5, 1.8, 1]} />
        {/* two vertical strip lights for the side highlights on the folds */}
        <Lightformer form="rect" intensity={1.6} position={[-2.6, 0.6, 1.2]} rotation-y={Math.PI / 2.4} scale={[0.8, 3, 1]} />
        <Lightformer form="rect" intensity={1.1} position={[2.6, 0.4, 1.4]} rotation-y={-Math.PI / 2.4} scale={[0.8, 3, 1]} />
        {/* warm rim from behind */}
        <Lightformer form="rect" intensity={1.4} position={[0, 1.2, -2.6]} scale={[3, 1.2, 1]} color="#ffe7c2" />
        {/* soft floor bounce */}
        <Lightformer form="rect" intensity={0.5} position={[0, -2.2, 0.5]} rotation-x={Math.PI / 2} scale={[4, 4, 1]} />
      </Environment>
      <directionalLight
        position={[1.4, 3.2, 2.6]}
        intensity={1.35}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.012}
        shadow-camera-left={-1.2}
        shadow-camera-right={1.2}
        shadow-camera-top={1.2}
        shadow-camera-bottom={-1.2}
        shadow-camera-near={0.5}
        shadow-camera-far={8}
      />
      <ambientLight intensity={0.12} />
      {shadowOpacity > 0 ? (
        <ContactShadows position={[0, floorY, 0]} scale={2.2} far={1} blur={2.6} opacity={shadowOpacity} resolution={1024} color="#1b2238" />
      ) : null}
    </>
  );
}
