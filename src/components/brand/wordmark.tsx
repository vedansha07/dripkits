import Link from "next/link";
import { cn } from "@/lib/utils";

export type WordmarkVariant = "a" | "b" | "c";

// Placeholder mark until his logo arrives, but designed: the type system runs everything
// jersey-related narrow, so the mark is the one place the family is stretched wide.
//   a  lowercase, wide, one colour
//   b  lowercase, wide, "drip" in kit gold
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
        <span className="text-primary">drip</span>kits
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
