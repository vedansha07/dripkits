import { ProductCard } from "@/components/product/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getFeaturedProducts } from "@/lib/queries";

// Horizontal scroll-snap on mobile, four-up grid from lg. One layout family, used once.
export async function FeaturedRail() {
  const items = await getFeaturedProducts(8);
  if (items.length === 0) return null;
  return (
    <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0">
      {items.map((p, i) => (
        <li key={p.id} className="w-[68vw] shrink-0 snap-start sm:w-[44vw] lg:w-auto">
          <ProductCard product={p} priority={i === 0} />
        </li>
      ))}
    </ul>
  );
}

export function FeaturedRailSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[3/4] w-full" />
          <div className="space-y-2 p-3"><Skeleton className="h-3 w-20" /><Skeleton className="h-4 w-40" /><Skeleton className="h-4 w-16" /></div>
        </div>
      ))}
    </div>
  );
}
