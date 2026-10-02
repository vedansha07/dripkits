import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { HeaderShell } from "@/components/header-shell";

// Category-only nav, per the spec: 26/27, Fan Version, and the demand table.
// Cart and account arrive with Phase 2.
const NAV: Array<[string, string]> = [
  ["26/27", "/shop/26-27"],
  ["Fan Version", "/shop/fan-version"],
  ["Most wanted", "/#table"],
];

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  return (
    <HeaderShell overlay={overlay}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Wordmark variant="a" className="text-2xl" />
        <nav aria-label="Main" className="flex items-center gap-0.5 whitespace-nowrap text-[13px] font-semibold sm:text-sm">
          {NAV.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-full px-2 py-2 transition-colors hover:bg-foreground/[0.06] sm:px-3">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </HeaderShell>
  );
}
