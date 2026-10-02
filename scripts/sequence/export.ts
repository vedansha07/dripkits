// Turns a Remotion PNG sequence into the scroll player's assets:
//   public/sequences/<name>/<size>/0000.webp ...   transparent WebP, cropped
//   public/sequences/<name>/manifest.json          frame count, sizes, crop rect
//
// Every frame is cropped to the union of where anything is ever drawn, so the canvas can place
// the crop back into the full square and the framing never shifts between frames.
//
// Usage: pnpm sequence:export <pngDir> <name>

import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const SIZES = [1200, 720]; // width of the FULL square at each size; the crop scales with it
const QUALITY = { quality: 80, alphaQuality: 90, effort: 5 };

async function main() {
  const [dir, name] = process.argv.slice(2);
  if (!dir || !name) throw new Error("usage: export <pngDir> <name>");
  const files = readdirSync(dir).filter((f) => f.endsWith(".png")).sort();
  if (files.length === 0) throw new Error(`no PNG frames in ${dir}`);

  // union bounding box of visible pixels across all frames
  let full = 0, minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
  for (const f of files) {
    const { data, info } = await sharp(join(dir, f)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    full = info.width;
    const c = info.channels;
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        if (data[(y * info.width + x) * c + 3] > 6) {
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      }
    }
  }
  const pad = Math.round(full * 0.01);
  const crop = {
    x: Math.max(0, minX - pad),
    y: Math.max(0, minY - pad),
    w: Math.min(full, maxX + pad + 1) - Math.max(0, minX - pad),
    h: Math.min(full, maxY + pad + 1) - Math.max(0, minY - pad),
  };
  console.log(`frames ${files.length}, full ${full}px, crop ${crop.w}x${crop.h} at ${crop.x},${crop.y} (${((crop.w * crop.h * 100) / (full * full)).toFixed(0)}% of the square)`);

  const out = join("public", "sequences", name);
  rmSync(out, { recursive: true, force: true });
  const bytes: Record<number, number> = {};
  for (const size of SIZES) {
    const dirOut = join(out, String(size));
    mkdirSync(dirOut, { recursive: true });
    const s = size / full;
    const w = Math.round(crop.w * s), h = Math.round(crop.h * s);
    bytes[size] = 0;
    for (let i = 0; i < files.length; i++) {
      const info = await sharp(join(dir, files[i]))
        .extract({ left: crop.x, top: crop.y, width: crop.w, height: crop.h })
        .resize(w, h, { kernel: "lanczos3" })
        .webp(QUALITY)
        .toFile(join(dirOut, `${String(i).padStart(4, "0")}.webp`));
      bytes[size] += info.size;
    }
    console.log(`  ${size}: ${w}x${h} per frame, ${(bytes[size] / 1e6).toFixed(1)} MB total, ${(bytes[size] / files.length / 1e3).toFixed(0)} KB avg`);
  }

  writeFileSync(join(out, "manifest.json"), JSON.stringify({
    name,
    frames: files.length,
    sizes: SIZES,
    // crop rect as fractions of the full square, for placing frames back into it
    crop: { x: crop.x / full, y: crop.y / full, w: crop.w / full, h: crop.h / full },
    bytes,
  }, null, 1));
  console.log(`wrote ${out}/manifest.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
