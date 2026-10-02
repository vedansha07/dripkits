const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const count = new Intl.NumberFormat("en-IN");

/** Paise in, "₹1,999" out. Never format money from a float. */
export function formatINR(paise: number) {
  return inr.format(Math.round(paise / 100));
}

/** 1203 -> "1,203" with Indian grouping. */
export function formatCount(n: number) {
  return count.format(n);
}

const shortDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });

/** "2026-10-14" -> "14 Oct" */
export function formatDropDate(iso: string) {
  return shortDate.format(new Date(iso + "T00:00:00"));
}
