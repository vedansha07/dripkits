import Link from "next/link";
import { cn } from "@/lib/utils";

// On the home page the jersey comes back to rest between the links and a wordmark the full width
// of the page, a bookend to the hero. Elsewhere the footer is the same without that landing space.

const COLUMNS: Array<{ title: string; links: Array<[string, string]> }> = [
  { title: "Shop", links: [["26/27", "/shop/26-27"], ["Fan Version", "/shop/fan-version"], ["Most wanted", "/#wanted"], ["The table", "/#table"]] },
  { title: "Help", links: [["Track order", "/track"], ["Size guide", "/fit"], ["Contact", "/support"]] },
  { title: "Policies", links: [["Shipping", "/policies/shipping"], ["Returns", "/policies/returns"], ["Privacy", "/policies/privacy"], ["Terms", "/policies/terms"]] },
];

export function SiteFooter({ stage = false }: { stage?: boolean }) {
  return (
    <footer id="footer" className={cn("relative overflow-hidden", stage && "flex min-h-[100svh] flex-col")}>
      <div className={cn("relative z-[3] mx-auto grid w-full max-w-[1400px] grid-cols-3 gap-x-6 gap-y-8 px-4 sm:px-8 md:grid-cols-12", stage ? "pt-24" : "pt-14")}>
        <p className="col-span-3 max-w-[30ch] text-base text-foreground/70 md:col-span-6">
          Football kits for India. Buy what is in stock, claim your size on what is not.
        </p>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title} className="md:col-span-2">
            <p className="text-sm font-semibold">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} prefetch={false} className="text-sm text-foreground/65 transition-colors hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      {/* where the jersey lands */}
      {stage ? <div aria-hidden="true" className="min-h-[30svh] flex-1" /> : null}
      <p aria-hidden="true" data-footer-word className="type-wordmark relative z-[1] mt-10 select-none whitespace-nowrap text-center text-[23.5vw] leading-[0.74] tracking-[-0.07em]">
        dripkits
      </p>
      <div className="relative z-[3] mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-5 text-xs text-foreground/60 sm:px-8">
        <span>© 2026 dripkits</span>
        <span className="type-num">Ships from India</span>
      </div>
    </footer>
  );
}
