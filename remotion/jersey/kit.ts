// Kit art, painted onto the flat pattern pieces in metres, the way a sublimated jersey is
// printed before it is sewn. Colourways come from designs.ts. No club crest, no manufacturer or
// sponsor marks: those are trademarks. Our own mark sits where the crest would.

import { jerseyPattern, type V2 } from "../../scripts/garment/pattern";
import type { GarmentMeta } from "./data";
import type { KitDesign, Shade } from "./designs";

const SENYERA = { yellow: "#F6C437", red: "#C8102E" };

type Fonts = { number: string; wordmark: string };

/** Paints the 4096 px atlas. The UVs written by the simulator map each panel into its rect. */
export function paintKit(meta: GarmentMeta, fonts: Fonts, design: KitDesign, opts: { senyera?: boolean } = {}): HTMLCanvasElement {
  const pattern = jerseyPattern();
  const { size, pxPerMetre: k, rects } = meta.atlas;
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = design.trim;
  ctx.fillRect(0, 0, size, size);

  for (const panel of meta.panels) {
    const r = rects[panel.name];
    const def = pattern.panels.find((p) => p.name === panel.name)!;
    const seg = (id: string) => def.segs.find((s) => s.id === id)!.pts;
    // pattern metres (y up) -> atlas pixels (y down)
    ctx.setTransform(k, 0, 0, -k, r.ox - r.minX * k, r.oy + r.maxY * k);

    const outlinePath = () => {
      ctx.beginPath();
      panel.outline.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
    };
    // bleed 2.5 cm past the outline so filtered edge texels carry print colour, not background
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const [px, py] of panel.outline) { x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); }
    x0 -= 0.025; x1 += 0.025; y0 -= 0.025; y1 += 0.025;

    if (panel.name === "front" || panel.name === "back") {
      body(ctx, design, x0, x1, y0, y1);
      if (design.facade) facade(ctx, x0, x1, y0, y1);
      if (design.pinstripe) pinstripes(ctx, design.pinstripe, x0, x1, y0, y1);
      ctx.save();
      outlinePath();
      ctx.clip();
      ribbing(ctx, x0, x1, y0, y1);
      band(ctx, seg("neck"), 0.024, 0.0045, design);
      stitch(ctx, seg("hem"), 0.014);
      if (panel.name === "front") frontArt(ctx, k, fonts, design);
      else backArt(ctx, k, fonts, design, opts.senyera ?? false);
      ctx.restore();
    } else {
      const c = panel.name === "sleeveR" ? design.sleeves.right : design.sleeves.left;
      shaded(ctx, x0, x1, y0, y1, c);
      if (design.facade) facade(ctx, x0, x1, y0, y1);
      ctx.save();
      outlinePath();
      ctx.clip();
      ribbing(ctx, x0, x1, y0, y1);
      band(ctx, seg("cuff"), 0.026, 0.004, design);
      ctx.restore();
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return canvas;
}

function body(ctx: CanvasRenderingContext2D, d: KitDesign, x0: number, x1: number, y0: number, y1: number) {
  const b = d.body;
  if (b.kind === "solid") return shaded(ctx, x0, x1, y0, y1, b.c);
  if (b.kind === "stripes") {
    for (const s of b.stripes) shaded(ctx, Math.max(s.from, x0), Math.min(s.to, x1), y0, y1, s.c);
    return;
  }
  shaded(ctx, x0, x1, y0, y1, b.base);
  shaded(ctx, b.from, b.to, y0, y1, b.band);
  if (b.edge) {
    ctx.fillStyle = b.edge;
    ctx.fillRect(b.from - 0.008, y0, 0.008, y1 - y0);
    ctx.fillRect(b.to, y0, 0.008, y1 - y0);
  }
}

/** A field with a gentle diagonal tonal gradient; edges between fields stay crisp, like print. */
function shaded(ctx: CanvasRenderingContext2D, x0: number, x1: number, y0: number, y1: number, [deep, mid, bright]: Shade) {
  if (x1 <= x0) return;
  const g = ctx.createLinearGradient(x0, y1, x1, y0 - 0.25);
  g.addColorStop(0, bright);
  g.addColorStop(0.55, mid);
  g.addColorStop(1, deep);
  ctx.fillStyle = g;
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
}

/** Facade bands: thin diagonal lifts, after the new Camp Nou exterior. */
function facade(ctx: CanvasRenderingContext2D, x0: number, x1: number, y0: number, y1: number) {
  ctx.save();
  ctx.globalAlpha = 0.035;
  ctx.fillStyle = "#ffffff";
  for (let i = -80; i < 80; i++) {
    const base = i * 0.022;
    ctx.beginPath();
    ctx.moveTo(x0, y0 + base);
    ctx.lineTo(x1, y0 + base + (x1 - x0) * 0.35);
    ctx.lineTo(x1, y0 + base + (x1 - x0) * 0.35 + 0.006);
    ctx.lineTo(x0, y0 + base + 0.006);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  void y1;
}

function pinstripes(ctx: CanvasRenderingContext2D, color: string, x0: number, x1: number, y0: number, y1: number) {
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.0016;
  for (let x = Math.ceil(x0 / 0.032) * 0.032; x < x1; x += 0.032) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); }
  ctx.restore();
}

/** The subtle linear texture in the fabric. */
function ribbing(ctx: CanvasRenderingContext2D, x0: number, x1: number, y0: number, y1: number) {
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 0.0009;
  for (let x = x0; x < x1; x += 0.004) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); }
  ctx.restore();
}

/** A rib band along an edge, inside the panel, with piping on its inner edge. */
function band(ctx: CanvasRenderingContext2D, edge: V2[], width: number, piping: number, d: KitDesign) {
  const path = () => { ctx.beginPath(); edge.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); };
  ctx.lineJoin = "round";
  ctx.lineCap = "butt";
  path(); ctx.strokeStyle = d.piping; ctx.lineWidth = 2 * (width + piping); ctx.stroke();
  path(); ctx.strokeStyle = d.trim; ctx.lineWidth = 2 * width; ctx.stroke();
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.setLineDash([0.0012, 0.0028]);
  path(); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2 * width * 0.92; ctx.stroke();
  ctx.restore();
}

/** Double-needle hem stitching. */
function stitch(ctx: CanvasRenderingContext2D, edge: V2[], inset: number) {
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = "#05070f";
  ctx.lineWidth = 0.0012;
  ctx.setLineDash([0.004, 0.0025]);
  for (const dd of [inset, inset + 0.006]) {
    ctx.beginPath();
    edge.forEach(([x, y], i) => (i ? ctx.lineTo(x, y + dd) : ctx.moveTo(x, y + dd)));
    ctx.stroke();
  }
  ctx.restore();
}

/** Upright text at pattern position (x, y) metres, height in metres. Mirror for the back. */
function text(ctx: CanvasRenderingContext2D, k: number, s: string, x: number, y: number, sizeM: number, family: string, color: string, opts: { mirror?: boolean; tracking?: number; stroke?: string; weight?: number } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale((opts.mirror ? -1 : 1) / k, -1 / k);
  // CSS font shorthand: weight before size, or the browser rejects it and keeps a 10px default
  ctx.font = `${opts.weight ?? 400} ${Math.round(sizeM * k)}px ${family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const c = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  if (opts.tracking && "letterSpacing" in c) c.letterSpacing = `${Math.round(opts.tracking * k)}px`;
  if (opts.stroke) {
    ctx.lineJoin = "round";
    ctx.strokeStyle = opts.stroke;
    ctx.lineWidth = sizeM * k * 0.06;
    ctx.strokeText(s, 0, 0);
  }
  ctx.fillStyle = color;
  ctx.fillText(s, 0, 0);
  ctx.restore();
}

function frontArt(ctx: CanvasRenderingContext2D, k: number, fonts: Fonts, d: KitDesign) {
  // chest wordmark, where the shirt sponsor sits
  text(ctx, k, "dripkits", 0, 0.255, 0.05, fonts.wordmark, d.ink, { tracking: -0.0015, weight: 900 });
  // our badge where the crest would be: wearer's left chest
  const cx = 0.112, cy = 0.392, w = 0.058, h = 0.07;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, cy + h / 2);
  ctx.lineTo(cx + w / 2, cy + h / 2);
  ctx.lineTo(cx + w / 2, cy - h * 0.05);
  ctx.quadraticCurveTo(cx + w / 2, cy - h * 0.38, cx, cy - h / 2);
  ctx.quadraticCurveTo(cx - w / 2, cy - h * 0.38, cx - w / 2, cy - h * 0.05);
  ctx.closePath();
  ctx.fillStyle = d.trim;
  ctx.fill();
  ctx.lineWidth = 0.0035;
  ctx.strokeStyle = d.ink;
  ctx.stroke();
  ctx.restore();
  text(ctx, k, "DK", cx, cy + 0.006, 0.03, fonts.number, d.ink, { tracking: 0.001 });
  text(ctx, k, "10", -0.108, 0.385, 0.05, fonts.number, d.ink);
}

function backArt(ctx: CanvasRenderingContext2D, k: number, fonts: Fonts, d: KitDesign, senyera: boolean) {
  // seen from behind the pattern is mirrored, so everything on the back is drawn mirrored
  if (senyera) {
    const n = 9, bw = 0.0095, bh = 0.014, y = 0.488;
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = i % 2 ? SENYERA.red : SENYERA.yellow;
      ctx.fillRect(-((n * bw) / 2) + i * bw, y - bh / 2, bw, bh);
    }
  }
  text(ctx, k, "DRIPKITS", 0, 0.392, 0.062, fonts.number, d.ink, { mirror: true, tracking: 0.004 });
  text(ctx, k, "10", 0, 0.185, 0.27, fonts.number, d.ink, { mirror: true, stroke: d.outline });
}

/** Fine knit height field for the bump map; tiles seamlessly. */
export function paintKnit(size = 256): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);
  const cells = 8, c = size / cells;
  for (let j = 0; j < cells; j++) {
    for (let i = 0; i < cells; i++) {
      for (const off of [0.3, 0.7]) {
        const g = ctx.createRadialGradient((i + off) * c, (j + 0.5) * c, 0, (i + off) * c, (j + 0.5) * c, c * 0.42);
        g.addColorStop(0, "rgba(255,255,255,0.55)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse((i + off) * c, (j + 0.5) * c, c * 0.2, c * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  return canvas;
}
