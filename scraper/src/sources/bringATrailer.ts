import * as cheerio from "cheerio";
import { fetchPage } from "../lib/httpClient";
import type { ParsedListing } from "../lib/upsert";

const BASE_URL = "https://bringatrailer.com";
const LISTING_URL_PATTERN = /^https:\/\/(www\.)?bringatrailer\.com\/listing\/[a-z0-9-]+\/?$/i;

/**
 * Finds every individual auction-listing URL linked from a model results page.
 * Deliberately does not depend on any particular card/grid CSS class — those
 * are the parts of BaT's markup most likely to have shifted since this was
 * written without live verification (see scraper/README.md). A listing URL
 * always looks like bringatrailer.com/listing/<slug>/, which is a much more
 * stable target to depend on.
 */
export function extractListingUrls(html: string): string[] {
  const $ = cheerio.load(html);
  const urls = new Set<string>();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const absolute = href.startsWith("http") ? href : new URL(href, BASE_URL).toString();
    if (LISTING_URL_PATTERN.test(absolute)) {
      urls.add(absolute.replace(/\/?$/, "/"));
    }
  });

  return [...urls];
}

const SOLD_PATTERN = /Sold for\s+(?:USD\s*)?\$?([\d,]+)\s+on\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/i;
const RESERVE_NOT_MET_PATTERN = /Bid to\s+(?:USD\s*)?\$?([\d,]+)(?:\s+on\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}))?/i;
const MILEAGE_PATTERN = /([\d,]+)\s*(?:Miles|Original Miles|Indicated Miles)\b/i;
const VIN_PATTERN = /(?:Chassis|VIN)\s*(?:No\.?|Number)?\s*:?\s*([A-HJ-NPR-Z0-9]{6,17})/i;
const LOCATION_PATTERN = /Location\s*:?\s*([A-Za-z .,'-]+?,\s*[A-Za-z]{2,})/;

function parsePrice(raw: string): number {
  return Number(raw.replace(/,/g, ""));
}

function parseDate(raw: string): Date | null {
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function extractTitle($: cheerio.CheerioAPI): string {
  const h1 = $("h1").first().text().trim();
  if (h1) return h1;
  const title = $("title").text().trim();
  return title.replace(/\s*\|\s*Bring a Trailer\s*$/i, "").trim();
}

function extractJsonLdPrice($: cheerio.CheerioAPI): number | null {
  let price: number | null = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    if (price !== null) return;
    try {
      const data = JSON.parse($(el).contents().text());
      const nodes = Array.isArray(data) ? data : [data];
      for (const node of nodes) {
        const offerPrice = node?.offers?.price ?? node?.offers?.[0]?.price;
        if (offerPrice) {
          const parsed = Number(offerPrice);
          if (!Number.isNaN(parsed)) price = parsed;
        }
      }
    } catch {
      // Not all script[type=application/ld+json] blocks are guaranteed valid/relevant JSON.
    }
  });
  return price;
}

/**
 * Parses a single Bring a Trailer listing page into a normalized ParsedListing.
 * Uses text-pattern matching against page copy ("Sold for $X on <date>") rather
 * than guessed CSS selectors, since BaT has used that human-readable phrasing
 * consistently. Fields that can't be found are left null rather than guessed.
 */
export function parseListingPage(html: string, url: string): ParsedListing {
  const $ = cheerio.load(html);
  const bodyText = $("body").text().replace(/\s+/g, " ");
  const title = extractTitle($);
  const imageUrl = $('meta[property="og:image"]').attr("content") ?? null;

  const soldMatch = bodyText.match(SOLD_PATTERN);
  const reserveMatch = !soldMatch ? bodyText.match(RESERVE_NOT_MET_PATTERN) : null;

  const jsonLdPrice = extractJsonLdPrice($);
  const mileageMatch = bodyText.match(MILEAGE_PATTERN);
  const vinMatch = bodyText.match(VIN_PATTERN);
  const locationMatch = bodyText.match(LOCATION_PATTERN);

  let status: ParsedListing["status"] = "UNKNOWN";
  let salePrice: number | null = jsonLdPrice;
  let saleDate: Date | null = null;

  if (soldMatch) {
    status = "SOLD";
    salePrice = parsePrice(soldMatch[1]);
    saleDate = parseDate(soldMatch[2]);
  } else if (reserveMatch) {
    status = "RESERVE_NOT_MET";
    salePrice = null;
    saleDate = reserveMatch[2] ? parseDate(reserveMatch[2]) : null;
  }

  return {
    source: "BAT",
    url,
    title,
    status,
    salePrice,
    currency: "USD",
    saleDate,
    mileage: mileageMatch ? Number(mileageMatch[1].replace(/,/g, "")) : null,
    vin: vinMatch ? vinMatch[1] : null,
    location: locationMatch ? locationMatch[1].trim() : null,
    imageUrl,
  };
}

/**
 * Scrapes every seeded model's BaT results page: finds listing URLs, fetches
 * and parses each one. Respects rate limiting / robots.txt / caching via
 * fetchPage. Returns all parsed listings for the caller to upsert.
 */
export async function scrapeBringATrailer(categoryPaths: string[]): Promise<ParsedListing[]> {
  const listingUrls = new Set<string>();

  for (const categoryPath of categoryPaths) {
    const categoryUrl = `${BASE_URL}/${categoryPath.replace(/^\/|\/$/g, "")}/`;
    try {
      const html = await fetchPage(categoryUrl);
      for (const url of extractListingUrls(html)) listingUrls.add(url);
    } catch (err) {
      console.warn(`[bringATrailer] failed to load category ${categoryUrl}: ${(err as Error).message}`);
    }
  }

  const listings: ParsedListing[] = [];
  for (const url of listingUrls) {
    try {
      const html = await fetchPage(url);
      listings.push(parseListingPage(html, url));
    } catch (err) {
      console.warn(`[bringATrailer] failed to parse listing ${url}: ${(err as Error).message}`);
    }
  }

  return listings;
}
