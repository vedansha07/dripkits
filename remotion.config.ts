// Remotion renders the hero frame sequences. Its sources live in remotion/, its assets in
// remotion/public (kept out of Next's public/ so 15 MB of simulation data never ships).
import { Config } from "@remotion/cli/config";

Config.setEntryPoint("remotion/index.ts");
Config.setPublicDir("remotion/public");
Config.setChromiumOpenGlRenderer("angle"); // GPU WebGL for three.js renders
Config.setVideoImageFormat("png");
Config.setOverwriteOutput(true);
