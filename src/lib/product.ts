import type { VariantStatus } from "@/db/schema";

type VariantLike = { status: VariantStatus; interestCount: number; expectedDate: string | null };

/**
 * A product's headline state, derived from its sizes. Buyable beats everything: if one size is
 * in stock the product is in stock. Then upcoming, then interested, then sold out.
 */
export function productStatus(variants: VariantLike[]): VariantStatus {
  if (variants.some((v) => v.status === "in_stock")) return "in_stock";
  if (variants.some((v) => v.status === "upcoming")) return "upcoming";
  if (variants.some((v) => v.status === "interested")) return "interested";
  return "out_of_stock";
}

export function totalInterest(variants: VariantLike[]) {
  return variants.reduce((n, v) => n + v.interestCount, 0);
}

export function earliestDrop(variants: VariantLike[]) {
  const dates = variants.map((v) => v.expectedDate).filter((d): d is string => !!d).sort();
  return dates[0] ?? null;
}

export const STATUS_LABEL: Record<VariantStatus, string> = {
  in_stock: "In stock",
  interested: "Interested",
  upcoming: "Upcoming",
  out_of_stock: "Sold out",
};
