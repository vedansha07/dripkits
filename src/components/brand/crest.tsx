import Image from "next/image";
import { cn } from "@/lib/utils";

/** Black or white, whichever reads on the given hex. */
export function readableOn(hex: string): "#0a0a0a" | "#fafafa" {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  // relative luminance, sRGB
  const lin = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.4 ? "#0a0a0a" : "#fafafa";
}

// Dummy crest: initials on the club colour. Swaps to the real image the moment crestUrl is set.
export function Crest({
  name,
  shortName,
  color,
  crestUrl,
  size = 40,
  className,
}: {
  name: string;
  shortName: string;
  color: string;
  crestUrl?: string | null;
  size?: number;
  className?: string;
}) {
  if (crestUrl) {
    return (
      <Image
        src={crestUrl}
        alt={name}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full object-contain", className)}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={name}
      style={{ backgroundColor: color, color: readableOn(color), width: size, height: size, fontSize: size * 0.34 }}
      className={cn("type-display inline-flex shrink-0 items-center justify-center rounded-full", className)}
    >
      {shortName}
    </span>
  );
}
