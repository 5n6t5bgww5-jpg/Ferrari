import { formatDate, formatMileage, formatPrice } from "@/lib/format";
import { SourceBadge } from "./SourceBadge";

export interface SaleRow {
  id: string;
  url: string;
  title: string;
  saleDate: Date | null;
  salePrice: number | null;
  status: string;
  mileage: number | null;
  location: string | null;
  source: string;
}

export function SalesTable({ sales }: { sales: SaleRow[] }) {
  if (sales.length === 0) {
    return <p className="text-sm text-[var(--text-muted)]">No sales recorded yet for this model.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border-hairline)]">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--gridline)] text-left text-[var(--text-muted)]">
            <th className="px-3 py-2 font-medium">Date</th>
            <th className="px-3 py-2 font-medium">Listing</th>
            <th className="px-3 py-2 font-medium text-right">Price</th>
            <th className="px-3 py-2 font-medium text-right">Mileage</th>
            <th className="px-3 py-2 font-medium">Location</th>
            <th className="px-3 py-2 font-medium">Source</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id} className="border-b border-[var(--gridline)] last:border-0">
              <td className="px-3 py-2 whitespace-nowrap tabular-nums text-[var(--text-secondary)]">
                {sale.saleDate ? formatDate(sale.saleDate) : "—"}
              </td>
              <td className="px-3 py-2">
                <a href={sale.url} target="_blank" rel="noopener noreferrer" className="text-[var(--series-1)] hover:underline">
                  {sale.title}
                </a>
                {sale.status !== "SOLD" && (
                  <span className="ml-2 text-xs text-[var(--text-muted)]">({sale.status.replace(/_/g, " ").toLowerCase()})</span>
                )}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">{sale.salePrice !== null ? formatPrice(sale.salePrice) : "—"}</td>
              <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)]">
                {sale.mileage !== null ? formatMileage(sale.mileage) : "—"}
              </td>
              <td className="px-3 py-2 text-[var(--text-secondary)]">{sale.location ?? "—"}</td>
              <td className="px-3 py-2">
                <SourceBadge source={sale.source} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
