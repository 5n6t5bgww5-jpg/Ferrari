"use client";

import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDate, formatPrice } from "@/lib/format";

export interface PricePoint {
  saleDate: string; // ISO date
  salePrice: number;
}

export interface RollingPoint {
  saleDate: string; // ISO date
  average: number;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ dataKey?: string; value?: number; payload: { saleDate: string } }> }) {
  if (!active || !payload || payload.length === 0) return null;
  const date = formatDate(new Date(payload[0].payload.saleDate));
  return (
    <div className="rounded-md border border-[var(--border-hairline)] bg-[var(--surface-1)] px-3 py-2 text-sm shadow-sm">
      <div className="text-[var(--text-muted)]">{date}</div>
      {payload.map((entry) =>
        entry.value != null ? (
          <div key={entry.dataKey} className="font-medium text-[var(--text-primary)]">
            {entry.dataKey === "average" ? "90-day avg: " : "Sale: "}
            {formatPrice(entry.value)}
          </div>
        ) : null,
      )}
    </div>
  );
}

export function PriceChart({ sales, rollingAverage }: { sales: PricePoint[]; rollingAverage: RollingPoint[] }) {
  if (sales.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-[var(--border-hairline)] text-sm text-[var(--text-muted)]">
        No sale history yet for this model.
      </div>
    );
  }

  const merged = sales.map((s) => {
    const avg = rollingAverage.find((r) => r.saleDate === s.saleDate)?.average;
    return { saleDate: s.saleDate, salePrice: s.salePrice, average: avg ?? null };
  });

  return (
    <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4">
      <div className="mb-3 flex items-center gap-4 text-xs text-[var(--text-secondary)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: "var(--series-1)" }} aria-hidden="true" />
          Individual sales
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3" style={{ background: "var(--text-secondary)" }} aria-hidden="true" />
          Rolling average
        </span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={merged} margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
          <CartesianGrid stroke="var(--gridline)" vertical={false} />
          <XAxis
            dataKey="saleDate"
            tickFormatter={(v: string) => new Date(v).getFullYear().toString()}
            stroke="var(--baseline)"
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            minTickGap={40}
          />
          <YAxis
            tickFormatter={(v: number) => formatPrice(v)}
            stroke="var(--baseline)"
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter dataKey="salePrice" fill="var(--series-1)" />
          <Line dataKey="average" stroke="var(--text-secondary)" strokeWidth={2} dot={false} connectNulls />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
