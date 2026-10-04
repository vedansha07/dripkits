import Link from "next/link";
import { cn } from "@/lib/utils";

export type WordmarkVariant = "a" | "b" | "c";

// Placeholder mark until his logo arrives, but designed: the family at full width and weight.
//   a  lowercase, wide, one colour
//   b  lowercase, wide, "kits" outlined, the solid-and-outline language of the club marquee
//   c  uppercase, condensed (the jersey-name reading, kept for comparison)
export function Wordmark({
  variant = "a",
  className,
  href = "/",
}: {
  variant?: WordmarkVariant;
  className?: string;
  href?: string | null;
}) {
  const inner =
    variant === "c" ? (
      <span className="type-display">DRIPKITS</span>
    ) : variant === "b" ? (
      <span className="type-wordmark">
        drip<span className="text-transparent [-webkit-text-stroke:0.035em_currentColor]">kits</span>
      </span>
    ) : (
      <span className="type-wordmark">dripkits</span>
    );

  const cls = cn("inline-block select-none whitespace-nowrap", className);
  if (href === null) return <span className={cls}>{inner}</span>;
  return (
    <Link href={href} aria-label="dripkits, home" className={cls}>
      {inner}
    </Link>
  );
}
