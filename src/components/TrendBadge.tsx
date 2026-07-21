import { formatPctChange } from "@/lib/format";

/**
 * Price direction is shown with an icon + text label, not color alone
 * (colorblind-safe per the dataviz accessibility rule) — the arrow and the
 * sign carry the meaning; the delta color is a reinforcing accent only.
 */
export function TrendBadge({ pctChange }: { pctChange: number | null }) {
  if (pctChange === null) {
    return <span className="text-sm text-[var(--text-muted)]">No prior-period data</span>;
  }

  const isUp = pctChange > 0;
  const isFlat = pctChange === 0;
  const color = isFlat ? "text-[var(--text-secondary)]" : isUp ? "text-[var(--delta-good)]" : "text-[var(--delta-critical)]";
  const arrow = isFlat ? "→" : isUp ? "↑" : "↓";

  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${color}`}>
      <span aria-hidden="true">{arrow}</span>
      {formatPctChange(pctChange)}
    </span>
  );
}
