import { formatPrice } from "@/lib/format";
import { TrendBadge } from "./TrendBadge";

export function StatTile({
  label,
  avgPrice,
  count,
  pctChange,
}: {
  label: string;
  avgPrice: number | null;
  count: number;
  pctChange: number | null;
}) {
  return (
    <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4">
      <div className="text-sm text-[var(--text-muted)]">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
        {avgPrice !== null ? formatPrice(avgPrice) : "—"}
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <TrendBadge pctChange={pctChange} />
        <span className="text-xs text-[var(--text-muted)]">{count} sale{count === 1 ? "" : "s"}</span>
      </div>
    </div>
  );
}
