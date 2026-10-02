import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";

const COLUMNS: Array<{ title: string; links: Array<[string, string]> }> = [
  { title: "Shop", links: [["26/27", "/shop/26-27"], ["Fan Version", "/shop/fan-version"], ["Most wanted", "/#table"]] },
  { title: "Help", links: [["Track order", "/track"], ["Size guide", "/fit"], ["Contact", "/support"]] },
  { title: "Policies", links: [["Shipping", "/policies/shipping"], ["Returns", "/policies/returns"], ["Privacy", "/policies/privacy"], ["Terms", "/policies/terms"]] },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <Wordmark className="text-3xl" />
          <p className="mt-4 max-w-[34ch] text-sm text-muted-foreground">
            Football kits, worn as drip. Buy what is in stock, claim your size on what is not.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title} className="md:col-span-2">
            <p className="text-sm font-semibold">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 text-xs text-muted-foreground">
          <span>© 2026 dripkits</span>
          <span className="type-num">Ships from India</span>
        </div>
      </div>
    </footer>
  );
}
