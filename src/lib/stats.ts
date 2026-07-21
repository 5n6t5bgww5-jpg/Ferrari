const STAT_WINDOWS_DAYS = [7, 30, 90, 365] as const;
export type StatWindowDays = (typeof STAT_WINDOWS_DAYS)[number];
export { STAT_WINDOWS_DAYS };

export interface SoldSale {
  salePrice: number;
  saleDate: Date;
}

export interface WindowStats {
  windowDays: number;
  avgPrice: number;
  medianPrice: number;
  count: number;
  pctChange: number | null;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Computes avg/median/count/% change for a single rolling window, comparing
 * against the prior equal-length window (e.g. the last 30 days vs. the 30
 * days before that) so a "recent price change" figure has something to
 * compare against.
 */
export function computeWindowStats(sales: SoldSale[], windowDays: number, now = new Date()): WindowStats | null {
  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  const windowStart = new Date(now.getTime() - windowMs);
  const priorStart = new Date(now.getTime() - 2 * windowMs);

  const current = sales.filter((s) => s.saleDate >= windowStart && s.saleDate <= now);
  if (current.length === 0) return null;

  const prior = sales.filter((s) => s.saleDate >= priorStart && s.saleDate < windowStart);
  const currentPrices = current.map((s) => s.salePrice);
  const avgPrice = Math.round(currentPrices.reduce((a, b) => a + b, 0) / currentPrices.length);

  let pctChange: number | null = null;
  if (prior.length > 0) {
    const priorAvg = prior.reduce((a, b) => a + b.salePrice, 0) / prior.length;
    if (priorAvg > 0) pctChange = ((avgPrice - priorAvg) / priorAvg) * 100;
  }

  return {
    windowDays,
    avgPrice,
    medianPrice: Math.round(median(currentPrices)),
    count: current.length,
    pctChange,
  };
}

export function computeAllWindowStats(sales: SoldSale[], now = new Date()): WindowStats[] {
  return STAT_WINDOWS_DAYS.map((days) => computeWindowStats(sales, days, now)).filter(
    (s): s is WindowStats => s !== null,
  );
}

/** Simple trailing moving average over sold sales ordered by date, for chart overlays. */
export function rollingAverage(sales: SoldSale[], windowSize: number): { saleDate: Date; average: number }[] {
  const sorted = [...sales].sort((a, b) => a.saleDate.getTime() - b.saleDate.getTime());
  return sorted.map((sale, i) => {
    const windowSlice = sorted.slice(Math.max(0, i - windowSize + 1), i + 1);
    const average = windowSlice.reduce((sum, s) => sum + s.salePrice, 0) / windowSlice.length;
    return { saleDate: sale.saleDate, average: Math.round(average) };
  });
}
