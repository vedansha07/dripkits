import type { VariantStatus } from "@/db/schema";
import { cn } from "@/lib/utils";
import { STATUS_LABEL } from "@/lib/product";
import { formatDropDate } from "@/lib/format";

const STYLE: Record<VariantStatus, string> = {
  in_stock: "bg-status-in-stock/12 text-status-in-stock",
  interested: "bg-brand text-brand-foreground",
  upcoming: "bg-status-upcoming/12 text-status-upcoming",
  out_of_stock: "bg-muted text-muted-foreground",
};

// Pill, like every interactive-looking element. Status colours are the only colours on the
// page besides the brand yellow, and Interested IS the brand: a yellow fill with ink text.
export function StatusBadge({
  status,
  dropDate,
  className,
}: {
  status: VariantStatus;
  dropDate?: string | null;
  className?: string;
}) {
  const label = status === "upcoming" && dropDate ? `Dropping ${formatDropDate(dropDate)}` : STATUS_LABEL[status];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold tracking-wide",
        STYLE[status],
        className,
      )}
    >
      {label}
    </span>
  );
}
