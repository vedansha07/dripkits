import { Composition, Folder } from "remotion";
import { HeroBuild } from "./scenes/HeroBuild";
import { JerseyDebug } from "./scenes/JerseyDebug";
import { KitAtlas } from "./scenes/KitAtlas";
import { ProductShot } from "./scenes/ProductShot";
import { JerseyTurntable } from "./scenes/JerseyTurntable";

export const RemotionRoot = () => {
  return (
    <>
      <Folder name="Site">
        <Composition
          id="HeroBuild"
          component={HeroBuild}
          durationInFrames={150}
          fps={30}
          width={1400}
          height={1400}
          defaultProps={{ background: "transparent" }}
        />
        <Composition
          id="ProductShot"
          component={ProductShot}
          durationInFrames={1}
          fps={30}
          width={900}
          height={1200}
          defaultProps={{ design: "barcelona-home-26-27", view: "front" as const }}
        />
        <Composition
          id="KitAtlas"
          component={KitAtlas}
          durationInFrames={1}
          fps={30}
          width={4096}
          height={4096}
          defaultProps={{ design: "barcelona-home-26-27" }}
          calculateMetadata={({ props }) => (props.design === "knit" ? { width: 256, height: 256 } : {})}
        />
      </Folder>
      <Folder name="Inspect">
        <Composition
          id="JerseyTurntable"
          component={JerseyTurntable}
          durationInFrames={4}
          fps={1}
          width={1100}
          height={1100}
          defaultProps={{ background: "#E8EBF0" }}
        />
        <Composition
          id="JerseyDebug"
          component={JerseyDebug}
          durationInFrames={8}
          fps={1}
          width={900}
          height={900}
          defaultProps={{ showBody: true }}
        />
      </Folder>
    </>
  );
};
