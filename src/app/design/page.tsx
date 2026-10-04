import type { Metadata } from "next";
import { Wordmark, type WordmarkVariant } from "@/components/brand/wordmark";
import { Crest } from "@/components/brand/crest";
import { StatusBadge } from "@/components/product/status-badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { kitColors } from "@/lib/kit-palette";

export const metadata: Metadata = { title: "Design", robots: { index: false } };

const ATMOSPHERES = [
  ["barcelona-home-26-27", "Barcelona home"],
  ["inter-miami-home-26-27", "Inter Miami home"],
  ["al-nassr-home-26-27", "Al Nassr home"],
  ["argentina-home-26", "Argentina home"],
] as const;

// Internal. The design system on one page: wordmark variants, type, colour, shape, components.
export default function DesignPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative z-[3] mx-auto max-w-7xl space-y-16 px-4 pb-12 pt-28">
        <section>
          <h1 className="type-head text-4xl md:text-5xl">Wordmark, three variants</h1>
          <p className="mt-2 max-w-[60ch] text-sm text-muted-foreground">
            Pick one. Placeholder until the real logo arrives. Each shown on the two grounds the site uses.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <GroundPanel ground="atmosphere" />
            <GroundPanel ground="card" />
          </div>
        </section>

        <section>
          <h2 className="type-head text-3xl md:text-4xl">Type</h2>
          <div className="mt-6 space-y-6">
            <p className="type-giant text-6xl md:text-8xl">Giant 125</p>
            <p className="type-head text-4xl md:text-6xl">Headlines, wide and heavy</p>
            <p className="type-count text-6xl md:text-8xl">2,839</p>
            <p className="max-w-[65ch] text-base leading-relaxed text-muted-foreground">
              One variable family, Archivo, from squeezed counts to the expanded giant words, plus one mono. Prices and
              sizes use the mono:{" "}
              <span className="type-num inline-flex gap-4 text-foreground"><span>₹1,999</span><span>1,203</span><span>XL</span></span>
            </p>
          </div>
        </section>

        <section>
          <h2 className="type-head text-3xl md:text-4xl">Colour</h2>
          <p className="mt-2 max-w-[60ch] text-sm text-muted-foreground">
            Ink and a cool light ground carry the interface. The colour comes from the kit on screen: the page atmosphere
            takes three colours from it and crossfades when the jersey reprints.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Swatch name="background" cls="bg-background" />
            <Swatch name="card" cls="bg-card" />
            <Swatch name="ink" cls="bg-primary" />
            <Swatch name="muted text" cls="bg-muted-foreground" />
            <Swatch name="in stock" cls="bg-status-in-stock" />
            <Swatch name="upcoming" cls="bg-status-upcoming" />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ATMOSPHERES.map(([slug, label]) => {
              const [a, b, c] = kitColors(slug);
              return (
                <div key={slug} className="overflow-hidden rounded-[20px] bg-card">
                  <div
                    className="h-28"
                    style={{
                      background: `radial-gradient(60% 90% at 15% 10%, color-mix(in oklab, ${a} 45%, transparent), transparent), radial-gradient(60% 90% at 90% 90%, color-mix(in oklab, ${b} 40%, transparent), transparent), radial-gradient(40% 60% at 60% 40%, color-mix(in oklab, ${c} 35%, transparent), transparent), var(--background)`,
                    }}
                  />
                  <p className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
                    {[a, b, c].map((col) => <span key={col} className="size-3 rounded-full" style={{ background: col }} />)}
                    {label}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <StatusBadge status="in_stock" />
            <StatusBadge status="interested" />
            <StatusBadge status="upcoming" dropDate="2026-10-14" />
            <StatusBadge status="out_of_stock" />
          </div>
        </section>

        <section>
          <h2 className="type-head text-3xl md:text-4xl">Shape rule</h2>
          <p className="mt-2 max-w-[60ch] text-sm text-muted-foreground">
            Interactive is a pill. Containers are 20px, big panels 28px. Glass only floats over the jersey and the
            atmosphere.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="h-12 px-6">Claim your size</Button>
              <Button size="lg" variant="outline" className="glass h-12 px-6">Notify me</Button>
              <Button size="lg" variant="ghost" className="h-12 px-6">Ghost</Button>
              <Button size="lg" className="h-12 px-6" disabled>Sold out</Button>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email or phone</Label>
              <Input id="email" placeholder="you@example.com" className="h-11 rounded-full px-4" />
            </div>
          </div>
          <div className="glass mt-6 flex items-center gap-4 rounded-[20px] p-4">
            <Crest name="Real Madrid" shortName="RMA" color="#00529F" size={40} />
            <Crest name="Inter Miami" shortName="MIA" color="#F7B5CD" size={40} />
            <Crest name="Al Nassr" shortName="NAS" color="#FFE400" size={40} />
            <span className="text-sm text-muted-foreground">Dummy crests: initials on club colour, until real ones land.</span>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function GroundPanel({ ground }: { ground: "atmosphere" | "card" }) {
  const variants: WordmarkVariant[] = ["a", "b", "c"];
  return (
    <div
      className="rounded-[28px] bg-card p-6"
      style={
        ground === "atmosphere"
          ? { background: "radial-gradient(70% 90% at 10% 0%, color-mix(in oklab, #14388a 35%, transparent), transparent), radial-gradient(70% 90% at 100% 100%, color-mix(in oklab, #8a1437 30%, transparent), transparent), var(--background)" }
          : undefined
      }
    >
      <p className="mb-4 text-xs font-semibold opacity-60">{ground === "atmosphere" ? "On a kit atmosphere" : "On white"}</p>
      <div className="space-y-6">
        {variants.map((v) => (
          <div key={v} className="flex items-baseline gap-4">
            <span className="type-num w-4 text-xs opacity-60">{v}</span>
            <Wordmark variant={v} href={null} className="text-5xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Swatch({ name, cls }: { name: string; cls: string }) {
  return (
    <div>
      <div className={`h-14 rounded-[12px] border border-border ${cls}`} />
      <p className="mt-1.5 text-xs text-muted-foreground">{name}</p>
    </div>
  );
}
