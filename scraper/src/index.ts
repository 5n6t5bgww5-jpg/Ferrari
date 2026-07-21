import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { FERRARI_MODEL_SEEDS } from "./config/models.seed";
import { scrapeBringATrailer } from "./sources/bringATrailer";
import { upsertListings } from "./lib/upsert";
import { computeAllWindowStats } from "../../src/lib/stats";

const isDryRun = process.argv.includes("--dry-run");

async function recomputeModelStats(prisma: PrismaClient): Promise<void> {
  const models = await prisma.ferrariModel.findMany({ select: { id: true } });

  for (const model of models) {
    const sales = await prisma.saleRecord.findMany({
      where: { modelId: model.id, status: "SOLD", salePrice: { not: null }, saleDate: { not: null } },
      select: { salePrice: true, saleDate: true },
    });

    const soldSales = sales
      .filter((s): s is { salePrice: number; saleDate: Date } => s.salePrice !== null && s.saleDate !== null)
      .map((s) => ({ salePrice: s.salePrice, saleDate: s.saleDate }));

    const windowStats = computeAllWindowStats(soldSales);

    for (const stat of windowStats) {
      await prisma.modelStat.upsert({
        where: { modelId_windowDays: { modelId: model.id, windowDays: stat.windowDays } },
        create: {
          modelId: model.id,
          windowDays: stat.windowDays,
          avgPrice: stat.avgPrice,
          medianPrice: stat.medianPrice,
          count: stat.count,
          pctChange: stat.pctChange,
        },
        update: {
          avgPrice: stat.avgPrice,
          medianPrice: stat.medianPrice,
          count: stat.count,
          pctChange: stat.pctChange,
          computedAt: new Date(),
        },
      });
    }
  }
}

async function main() {
  const categoryPaths = FERRARI_MODEL_SEEDS.map((m) => m.batCategoryPath);
  console.log(`Scraping ${categoryPaths.length} Bring a Trailer model pages${isDryRun ? " (dry run)" : ""}...`);

  const listings = await scrapeBringATrailer(categoryPaths);
  console.log(`Parsed ${listings.length} listings.`);

  if (isDryRun) {
    const matched = listings.filter((l) => l.status !== "UNKNOWN").length;
    console.log(`Dry run: would upsert ${listings.length} listings (${matched} with a resolved sale status).`);
    console.log(JSON.stringify(listings.slice(0, 3), null, 2));
    return;
  }

  const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" });
  const prisma = new PrismaClient({ adapter });

  try {
    const summary = await upsertListings(prisma, listings);
    console.log(`Upserted ${summary.total} listings (${summary.matched} matched, ${summary.unmatched} unmatched).`);
    if (summary.unmatchedTitles.length > 0) {
      console.log("Unmatched titles (add a model/alias to fix):");
      for (const title of summary.unmatchedTitles) console.log(`  - ${title}`);
    }

    await recomputeModelStats(prisma);
    console.log("Recomputed model stats.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
