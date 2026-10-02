import Image from "next/image";
import Link from "next/link";
import { Crest } from "@/components/brand/crest";
import { StatusBadge } from "@/components/product/status-badge";
import { formatCount, formatINR } from "@/lib/format";
import { earliestDrop, productStatus, totalInterest } from "@/lib/product";
import type { FeaturedProduct } from "@/lib/queries";
import { cn } from "@/lib/utils";

// Containers are sharp, so the card has no radius. Hover lift is desktop only and transform only.
export function ProductCard({
  product,
  className,
  priority = false,
}: {
  product: FeaturedProduct;
  className?: string;
  /** First card in the first rail is often the LCP element; let Next preload it. */
  priority?: boolean;
}) {
  const status = productStatus(product.variants);
  const interest = totalInterest(product.variants);
  const front = product.media.find((m) => m.kind === "front") ?? product.media[0];
  const back = product.media.find((m) => m.kind === "back");

  return (
    <Link
      href={`/kits/${product.slug}`}
      className={cn(
        "group block bg-card text-card-foreground transition-transform duration-200 ease-out",
        "md:hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-ring",
        className,
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {front ? (
          <Image
            src={front.url}
            alt={front.alt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            priority={priority}
            className="object-cover transition-opacity duration-300 ease-out md:group-hover:opacity-0"
          />
        ) : null}
        {/* hover shows the back, name and number; desktop only, touch keeps the front */}
        {back ? (
          <Image
            src={back.url}
            alt=""
            aria-hidden="true"
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-300 ease-out md:group-hover:opacity-100"
          />
        ) : null}
      </div>
      {/* Nothing is overlaid on the photo; status lives with the price. */}
      <div className="flex items-start gap-3 p-3">
        <Crest name={product.club.name} shortName={product.club.shortName} color={product.club.primaryColor} crestUrl={product.club.crestUrl} size={32} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">{product.club.name}</p>
          <h3 className="truncate text-sm font-semibold">{product.name}</h3>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <span className="type-num text-sm">
              {formatINR(product.pricePaise)}
              {product.compareAtPaise ? (
                <span className="ml-1.5 text-xs text-muted-foreground line-through">{formatINR(product.compareAtPaise)}</span>
              ) : null}
            </span>
            <StatusBadge status={status} dropDate={earliestDrop(product.variants)} />
          </div>
          {status !== "in_stock" && interest > 0 ? (
            <p className="type-num mt-1 text-xs text-primary">#{formatCount(interest)} want this</p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
