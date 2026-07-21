import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { rollingAverage } from "@/lib/stats";
import { StatTile } from "@/components/StatTile";
import { PriceChart } from "@/components/PriceChart";
import { SalesTable } from "@/components/SalesTable";

export const revalidate = 0;

const WINDOW_LABELS: Record<number, string> = {
  7: "7 days",
  30: "30 days",
  90: "90 days",
  365: "1 year",
};

export default async function ModelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const model = await prisma.ferrariModel.findUnique({
    where: { slug },
    include: {
      stats: { orderBy: { windowDays: "asc" } },
      sales: { orderBy: { saleDate: "desc" } },
    },
  });

  if (!model) notFound();

  const soldSales = model.sales
    .filter((s) => s.status === "SOLD" && s.salePrice !== null && s.saleDate !== null)
    .map((s) => ({ salePrice: s.salePrice as number, saleDate: s.saleDate as Date }))
    .sort((a, b) => a.saleDate.getTime() - b.saleDate.getTime());

  const rolling = rollingAverage(soldSales, 5);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <Link href="/" className="text-sm text-[var(--series-1)] hover:underline">
        ← All models
      </Link>

      <header className="mt-4 mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{model.name}</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {model.yearStart}
          {model.yearEnd ? `–${model.yearEnd}` : "–present"} · {model.bodyStyles.split(",").join(", ")}
        </p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[7, 30, 90, 365].map((windowDays) => {
          const stat = model.stats.find((s) => s.windowDays === windowDays);
          return (
            <StatTile
              key={windowDays}
              label={WINDOW_LABELS[windowDays]}
              avgPrice={stat?.avgPrice ?? null}
              count={stat?.count ?? 0}
              pctChange={stat?.pctChange ?? null}
            />
          );
        })}
      </div>

      <div className="mb-6">
        <PriceChart
          sales={soldSales.map((s) => ({ saleDate: s.saleDate.toISOString(), salePrice: s.salePrice }))}
          rollingAverage={rolling.map((r) => ({ saleDate: r.saleDate.toISOString(), average: r.average }))}
        />
      </div>

      <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">Recent sales</h2>
      <SalesTable
        sales={model.sales.map((s) => ({
          id: s.id,
          url: s.url,
          title: s.title,
          saleDate: s.saleDate,
          salePrice: s.salePrice,
          status: s.status,
          mileage: s.mileage,
          location: s.location,
          source: s.source,
        }))}
      />
    </main>
  );
}
