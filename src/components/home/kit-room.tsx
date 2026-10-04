"use client";

// The table: every kit we carry. On desktop the live jersey stands on the left and wears whatever
// card you point at or focus; on phones the cards carry their own photos. Filters are client-side;
// the list is small and already on the page.

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { VariantStatus } from "@/db/schema";
import { formatCount, formatDropDate, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { showKit } from "@/components/stage/store";

export type RoomKit = {
  slug: string;
  name: string;
  club: string;
  clubColor: string;
  pricePaise: number;
  compareAtPaise: number | null;
  status: VariantStatus;
  interest: number;
  drop: string | null;
  front: string | null;
  back: string | null;
};

const FILTERS: Array<{ id: "all" | VariantStatus; label: string }> = [
  { id: "all", label: "All" },
  { id: "in_stock", label: "In stock" },
  { id: "interested", label: "Claiming" },
  { id: "upcoming", label: "Dropping soon" },
];

const CARD_LABEL: Record<VariantStatus, string> = {
  in_stock: "In stock",
  interested: "Claim open",
  upcoming: "Dropping soon",
  out_of_stock: "Sold out",
};

const STATUS_STYLE: Record<VariantStatus, string> = {
  in_stock: "bg-status-in-stock/12 text-status-in-stock",
  interested: "bg-foreground text-background",
  upcoming: "bg-status-upcoming/12 text-status-upcoming",
  out_of_stock: "bg-foreground/[0.07] text-foreground/60",
};

export function KitRoom({ kits }: { kits: RoomKit[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const shown = useMemo(() => (filter === "all" ? kits : kits.filter((k) => k.status === filter)), [kits, filter]);
  const [active, setActive] = useState(kits[0]?.slug ?? "");

  const tryOn = (slug: string) => {
    setActive(slug);
    showKit(slug);
  };

  return (
    <section id="table" className="relative" aria-label="The table" data-first-kit={kits[0]?.slug}>
      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 pb-24 sm:px-8 lg:grid-cols-[5fr_7fr] lg:gap-12">
        <div className="relative">
          <div className="relative z-[3] pt-24 lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:flex-col lg:justify-between lg:pb-10">
            <div>
              <h2 className="type-head text-[clamp(2.4rem,5vw,4.6rem)]">The table</h2>
              <p className="mt-3 max-w-sm text-base text-foreground/70">
                Every kit we carry. <span className="stage-hint hidden lg:inline">Point at one to try it on.</span>
              </p>
              <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter kits">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={filter === f.id}
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "h-10 rounded-full px-4 text-sm font-medium transition-colors",
                      filter === f.id ? "bg-primary text-primary-foreground" : "glass hover:bg-card",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {/* the live jersey stands here; this keeps the column's height on desktop */}
            <div aria-hidden="true" className="hidden min-h-0 flex-1 lg:block" />
            <p className="stage-hint hidden text-sm text-foreground/60 lg:block" aria-live="polite">
              Wearing: <span className="font-medium text-foreground">{kits.find((k) => k.slug === active)?.name}</span>
            </p>
          </div>
        </div>

        <ul className="relative z-[3] grid grid-cols-2 gap-3 sm:gap-4 lg:pt-24">
          {shown.map((k) => (
            <li key={k.slug}>
              <Link
                href={`/kits/${k.slug}`}
                prefetch={false}
                data-kit={k.slug}
                data-active={active === k.slug}
                onPointerMove={() => active !== k.slug && tryOn(k.slug)}
                onFocus={() => tryOn(k.slug)}
                className={cn(
                  "group block overflow-hidden rounded-[20px] bg-card/80 outline-none ring-foreground/80 transition-[transform,box-shadow] duration-300 ease-out focus-visible:ring-2",
                  "md:hover:-translate-y-1 md:hover:shadow-[0_18px_40px_-20px_rgb(13_15_21/0.35)]",
                  active === k.slug && "lg:ring-1",
                )}
              >
                <div className="relative aspect-[4/5] overflow-hidden" style={{ background: `color-mix(in oklab, ${k.clubColor} 14%, var(--card))` }}>
                  {k.front ? (
                    <Image
                      src={k.front}
                      alt={`${k.name}, front`}
                      fill
                      sizes="(min-width: 1024px) 28vw, 50vw"
                      className="object-contain p-3 transition-[opacity,scale] duration-500 ease-out md:group-hover:scale-[1.04] md:group-hover:opacity-0"
                    />
                  ) : null}
                  {k.back ? (
                    <Image
                      src={k.back}
                      alt=""
                      aria-hidden="true"
                      fill
                      sizes="(min-width: 1024px) 28vw, 50vw"
                      className="scale-[0.96] object-contain p-3 opacity-0 transition-[opacity,scale] duration-500 ease-out md:group-hover:scale-100 md:group-hover:opacity-100"
                    />
                  ) : null}
                </div>
                <div className="p-3 sm:p-4">
                  <p className="truncate text-xs text-foreground/60">{k.club}</p>
                  <h3 className="mt-0.5 line-clamp-2 min-h-[2.5em] text-sm font-semibold leading-tight sm:text-[15px]">{k.name}</h3>
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                    <span className="type-num text-sm">
                      {formatINR(k.pricePaise)}
                      {k.compareAtPaise ? <span className="ml-1.5 text-xs text-foreground/50 line-through">{formatINR(k.compareAtPaise)}</span> : null}
                    </span>
                    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", STATUS_STYLE[k.status])}>
                      {k.status === "upcoming" && k.drop ? `Drops ${formatDropDate(k.drop)}` : CARD_LABEL[k.status]}
                    </span>
                  </div>
                  {k.status !== "in_stock" && k.interest > 0 ? (
                    <p className="type-num mt-2 text-xs text-foreground/70">{formatCount(k.interest)} claims</p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
          {shown.length === 0 ? (
            <li className="col-span-2 rounded-[20px] bg-card/70 p-8 text-center">
              <p className="font-semibold">Nothing here right now.</p>
              <button type="button" onClick={() => setFilter("all")} className="mt-3 text-sm underline underline-offset-4">
                Show every kit
              </button>
            </li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}
