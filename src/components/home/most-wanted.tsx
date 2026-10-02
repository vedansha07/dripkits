import Link from "next/link";
import { Crest } from "@/components/brand/crest";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCount } from "@/lib/format";
import { getMostWanted } from "@/lib/queries";

// The Table: demand as a league table. Position, kit, club, count. Movement arrows arrive
// in Phase 1 once there is a daily snapshot to compare against.
export async function MostWanted() {
  const rows = await getMostWanted(10);
  if (rows.length === 0) return <EmptyTable />;

  return (
    <ol className="divide-y divide-border border-y border-border">
      {rows.map((r, i) => (
        <li key={r.id}>
          <Link
            href={`/kits/${r.slug}`}
            className="grid grid-cols-[2.5rem_2.5rem_1fr_auto] items-center gap-3 py-3 transition-colors hover:bg-card md:grid-cols-[3rem_2.5rem_1fr_auto] md:gap-4"
          >
            <span className="type-display text-2xl text-muted-foreground md:text-3xl">{String(i + 1).padStart(2, "0")}</span>
            <Crest name={r.club} shortName={r.clubShort} color={r.clubColor} crestUrl={r.crestUrl} size={36} />
            <span className="min-w-0">
              <span className="block truncate font-semibold">{r.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{r.club}</span>
            </span>
            <span className="type-num text-right text-primary">
              <span className="text-lg font-semibold md:text-xl">{formatCount(r.interest)}</span>
              <span className="ml-1 hidden text-xs text-muted-foreground sm:inline">want it</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export function MostWantedSkeleton() {
  return (
    <div className="divide-y divide-border border-y border-border">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="grid grid-cols-[2.5rem_2.5rem_1fr_auto] items-center gap-3 py-3 md:grid-cols-[3rem_2.5rem_1fr_auto] md:gap-4">
          <Skeleton className="h-7 w-8" />
          <Skeleton className="size-9 rounded-full" />
          <div className="space-y-1.5"><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-24" /></div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

function EmptyTable() {
  return (
    <div className="border-y border-border py-12 text-center">
      <p className="type-display text-3xl">No kits on the table yet</p>
      <p className="mt-2 text-sm text-muted-foreground">The first claim starts it.</p>
    </div>
  );
}
