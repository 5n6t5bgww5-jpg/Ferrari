import { prisma } from "@/lib/db";
import { ModelCard } from "@/components/ModelCard";

export const revalidate = 0;

export default async function OverviewPage() {
  const models = await prisma.ferrariModel.findMany({
    orderBy: { yearStart: "asc" },
    include: {
      stats: { where: { windowDays: 90 } },
    },
  });

  const latestScrape = await prisma.saleRecord.aggregate({ _max: { scrapedAt: true } });

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Ferrari Market Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Secondary-market sale prices by model, sourced from public Bring a Trailer auction results.
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {latestScrape._max.scrapedAt
            ? `Data last refreshed ${latestScrape._max.scrapedAt.toLocaleString("en-US")}`
            : "No data scraped yet — run `npm run scrape` to populate the dashboard."}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {models.map((model) => {
          const stat = model.stats[0];
          return (
            <ModelCard
              key={model.id}
              slug={model.slug}
              name={model.name}
              yearStart={model.yearStart}
              yearEnd={model.yearEnd}
              avgPrice={stat?.avgPrice ?? null}
              pctChange={stat?.pctChange ?? null}
              saleCount={stat?.count ?? 0}
            />
          );
        })}
      </div>
    </main>
  );
}
