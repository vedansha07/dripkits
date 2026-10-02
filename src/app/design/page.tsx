import type { Metadata } from "next";
import { Wordmark, type WordmarkVariant } from "@/components/brand/wordmark";
import { Crest } from "@/components/brand/crest";
import { StatusBadge } from "@/components/product/status-badge";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "Design", robots: { index: false } };

// Internal. The Phase 0 sign-off page: wordmark variants, tokens, type, components, both themes.
export default function DesignPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-16 px-4 py-12">
        <section>
          <h1 className="type-display text-4xl">Wordmark, three variants</h1>
          <p className="mt-2 max-w-[60ch] text-sm text-muted-foreground">
            Pick one. Placeholder until the real logo arrives. Each shown on the two grounds the site uses.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <GroundPanel ground="brand" />
            <GroundPanel ground="card" />
          </div>
        </section>

        <section>
          <h2 className="type-display text-3xl">Type</h2>
          <div className="mt-6 space-y-6">
            <p className="type-display text-6xl md:text-8xl">Squeezed for headlines 62%</p>
            <p className="type-wordmark text-4xl md:text-6xl">stretched for the mark 125%</p>
            <p className="max-w-[65ch] text-base leading-relaxed text-muted-foreground">
              Body is the same family at normal width. One font file carries all three, so the page loads one variable
              face and one mono. Numbers, prices and sizes always use the mono:{" "}
              <span className="type-num inline-flex gap-4 text-foreground"><span>₹1,999</span><span>1,203</span><span>XL</span></span>
            </p>
          </div>
        </section>

        <section>
          <h2 className="type-display text-3xl">Colour and status</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            <Swatch name="background" cls="bg-background" />
            <Swatch name="card" cls="bg-card" />
            <Swatch name="muted" cls="bg-muted" />
            <Swatch name="brand, signal yellow" cls="bg-brand" />
            <Swatch name="ink" cls="bg-primary" />
            <Swatch name="in stock" cls="bg-status-in-stock" />
            <Swatch name="upcoming" cls="bg-status-upcoming" />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <StatusBadge status="in_stock" />
            <StatusBadge status="interested" />
            <StatusBadge status="upcoming" dropDate="2026-10-14" />
            <StatusBadge status="out_of_stock" />
          </div>
        </section>

        <section>
          <h2 className="type-display text-3xl">Shape rule</h2>
          <p className="mt-2 max-w-[60ch] text-sm text-muted-foreground">
            Interactive is a pill. Containers are sharp. Inputs are 8px. No exceptions.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="flex flex-wrap items-center gap-3">
              <Button className="rounded-full">Claim your size</Button>
              <Button variant="outline" className="rounded-full">Notify me</Button>
              <Button variant="ghost" className="rounded-full">Ghost</Button>
              <Button className="rounded-full" disabled>Sold out</Button>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email or phone</Label>
              <Input id="email" placeholder="you@example.com" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-4 bg-card p-4">
            <Crest name="Real Madrid" shortName="RMA" color="#00529F" size={40} />
            <Crest name="Inter Miami" shortName="MIA" color="#F7B5CD" size={40} />
            <Crest name="Al Nassr" shortName="NAS" color="#FFE400" size={40} />
            <span className="text-sm text-muted-foreground">Dummy crests: initials on club colour, until real ones land.</span>
          </div>
        </section>
      </main>
    </>
  );
}

function GroundPanel({ ground }: { ground: "brand" | "card" }) {
  const variants: WordmarkVariant[] = ["a", "b", "c"];
  return (
    <div className={`${ground === "brand" ? "bg-brand text-brand-foreground" : "bg-card text-card-foreground"} p-6`}>
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide opacity-60">{ground === "brand" ? "on the yellow field" : "on white"}</p>
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
      <div className={`h-14 border border-border ${cls}`} />
      <p className="mt-1.5 text-xs text-muted-foreground">{name}</p>
    </div>
  );
}
