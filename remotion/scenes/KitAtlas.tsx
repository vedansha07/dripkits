// A kit's art as the flat texture atlas the site's live jersey wears (pnpm kits:render). Same
// paintKit as the catalogue renders, so the real-time jersey and the product photos match.
// design "knit" paints the 256 px knit bump tile instead.

import { useEffect, useRef, useState } from "react";
import { AbsoluteFill, cancelRender, continueRender, delayRender } from "remotion";
import { useGarment } from "../jersey/data";
import { DESIGNS } from "../jersey/designs";
import { kitFonts } from "../jersey/Jersey";
import { paintKit, paintKnit } from "../jersey/kit";

export const KitAtlas = ({ design }: { design: string }) => {
  const garment = useGarment();
  const ref = useRef<HTMLCanvasElement>(null);
  const [handle] = useState(() => delayRender("Painting kit atlas"));

  useEffect(() => {
    const out = ref.current;
    if (!garment || !out) return;
    Promise.all([kitFonts.anton.waitUntilDone(), kitFonts.archivo.waitUntilDone()])
      .then(() => {
        const src =
          design === "knit"
            ? paintKnit(256)
            : paintKit(
                garment.meta,
                { number: kitFonts.anton.fontFamily, wordmark: kitFonts.archivo.fontFamily },
                DESIGNS[design] ?? DESIGNS.hero,
                { senyera: design.startsWith("barcelona") },
              );
        out.width = src.width;
        out.height = src.height;
        out.getContext("2d")!.drawImage(src, 0, 0);
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [garment, design, handle]);

  return (
    <AbsoluteFill>
      <canvas ref={ref} style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};
