import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { TrendBadge } from "./TrendBadge";

export interface ModelCardProps {
  slug: string;
  name: string;
  yearStart: number;
  yearEnd: number | null;
  avgPrice: number | null;
  pctChange: number | null;
  saleCount: number;
}

export function ModelCard({ slug, name, yearStart, yearEnd, avgPrice, pctChange, saleCount }: ModelCardProps) {
  return (
    <Link
      href={`/models/${slug}`}
      className="block rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4 transition-colors hover:border-[var(--series-1)]"
    >
      <div className="text-xs text-[var(--text-muted)]">
        {yearStart}
        {yearEnd ? `–${yearEnd}` : "–present"}
      </div>
      <div className="mt-0.5 text-lg font-semibold text-[var(--text-primary)]">{name}</div>
      <div className="mt-3 text-xl font-semibold tabular-nums text-[var(--text-primary)]">
        {avgPrice !== null ? formatPrice(avgPrice) : "No recent sales"}
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <TrendBadge pctChange={pctChange} />
        <span className="text-xs text-[var(--text-muted)]">
          {saleCount} sale{saleCount === 1 ? "" : "s"} (90d)
        </span>
      </div>
    </Link>
  );
}
