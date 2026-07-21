import type { PrismaClient } from "../../../src/generated/prisma/client";
import { matchTitle, type MatchableModel } from "./modelMatcher";

export type SaleStatusValue = "SOLD" | "RESERVE_NOT_MET" | "UNKNOWN";
export type SourceValue = "BAT" | "CARS_AND_BIDS" | "RM_SOTHEBYS";

export interface ParsedListing {
  source: SourceValue;
  url: string;
  title: string;
  vin?: string | null;
  mileage?: number | null;
  location?: string | null;
  status: SaleStatusValue;
  salePrice?: number | null;
  currency?: string;
  saleDate?: Date | null;
  imageUrl?: string | null;
}

export interface UpsertSummary {
  total: number;
  matched: number;
  unmatched: number;
  unmatchedTitles: string[];
}

/**
 * Idempotently upserts parsed listings keyed on `url`, so re-running a scrape
 * over the same pages never creates duplicate SaleRecord rows. Unmatched
 * titles are still stored (with modelId: null) rather than dropped, so they
 * can be triaged later by adding a new alias/matchPattern.
 */
export async function upsertListings(
  prisma: PrismaClient,
  listings: ParsedListing[],
): Promise<UpsertSummary> {
  const models: MatchableModel[] = await prisma.ferrariModel.findMany({
    select: { id: true, slug: true, matchPatterns: true },
  });

  const summary: UpsertSummary = { total: listings.length, matched: 0, unmatched: 0, unmatchedTitles: [] };

  for (const listing of listings) {
    const { modelId, year } = matchTitle(listing.title, models);
    if (modelId) {
      summary.matched += 1;
    } else {
      summary.unmatched += 1;
      summary.unmatchedTitles.push(listing.title);
    }

    await prisma.saleRecord.upsert({
      where: { url: listing.url },
      create: {
        source: listing.source,
        url: listing.url,
        title: listing.title,
        modelId,
        year,
        vin: listing.vin ?? null,
        mileage: listing.mileage ?? null,
        location: listing.location ?? null,
        status: listing.status,
        salePrice: listing.salePrice ?? null,
        currency: listing.currency ?? "USD",
        saleDate: listing.saleDate ?? null,
        imageUrl: listing.imageUrl ?? null,
      },
      update: {
        title: listing.title,
        modelId,
        year,
        vin: listing.vin ?? null,
        mileage: listing.mileage ?? null,
        location: listing.location ?? null,
        status: listing.status,
        salePrice: listing.salePrice ?? null,
        currency: listing.currency ?? "USD",
        saleDate: listing.saleDate ?? null,
        imageUrl: listing.imageUrl ?? null,
        scrapedAt: new Date(),
      },
    });
  }

  return summary;
}
