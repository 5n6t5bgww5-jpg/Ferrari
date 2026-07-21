const SOURCE_LABELS: Record<string, string> = {
  BAT: "Bring a Trailer",
  CARS_AND_BIDS: "Cars & Bids",
  RM_SOTHEBYS: "RM Sotheby's",
};

export function SourceBadge({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--border-hairline)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">
      {SOURCE_LABELS[source] ?? source}
    </span>
  );
}
