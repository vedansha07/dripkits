import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { HeaderShell } from "@/components/header-shell";

// A floating glass pill. Category-only nav, per the spec: 26/27, Fan Version and the most wanted;
// the one action is the table. Cart and account arrive with Phase 2.
const NAV: Array<[string, string]> = [
  ["26/27", "/shop/26-27"],
  ["Fan Version", "/shop/fan-version"],
  ["Most wanted", "/#wanted"],
];

export function SiteHeader() {
  return (
    <HeaderShell>
      <div className="glass mx-auto flex h-14 max-w-[1100px] items-center justify-between gap-3 rounded-full pl-5 pr-2">
        <Wordmark variant="a" className="text-[22px]" />
        <nav aria-label="Main" className="hidden items-center gap-0.5 whitespace-nowrap text-sm font-medium md:flex">
          {NAV.map(([label, href]) => (
            <Link key={href} href={href} prefetch={false} className="rounded-full px-3.5 py-2 transition-colors hover:bg-foreground/[0.06]">
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/#table" className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-transform active:scale-[0.98]">
          Shop the table
        </Link>
      </div>
    </HeaderShell>
  );
}
