import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { FERRARI_MODEL_SEEDS } from "../scraper/src/config/models.seed";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const seed of FERRARI_MODEL_SEEDS) {
    await prisma.ferrariModel.upsert({
      where: { slug: seed.slug },
      create: {
        slug: seed.slug,
        name: seed.name,
        series: seed.series,
        yearStart: seed.yearStart,
        yearEnd: seed.yearEnd,
        bodyStyles: seed.bodyStyles.join(","),
        aliases: JSON.stringify(seed.aliases),
        matchPatterns: JSON.stringify(seed.matchPatterns),
      },
      update: {
        name: seed.name,
        series: seed.series,
        yearStart: seed.yearStart,
        yearEnd: seed.yearEnd,
        bodyStyles: seed.bodyStyles.join(","),
        aliases: JSON.stringify(seed.aliases),
        matchPatterns: JSON.stringify(seed.matchPatterns),
      },
    });
  }
  console.log(`Seeded ${FERRARI_MODEL_SEEDS.length} Ferrari models.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
