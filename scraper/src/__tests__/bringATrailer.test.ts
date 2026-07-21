import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { extractListingUrls, parseListingPage } from "../sources/bringATrailer";

const fixturesDir = path.resolve(__dirname, "../../fixtures");
const readFixture = (name: string) => readFileSync(path.join(fixturesDir, name), "utf-8");

describe("extractListingUrls", () => {
  it("finds unique absolute listing URLs regardless of card markup", () => {
    const html = readFixture("bat-category-index.html");
    const urls = extractListingUrls(html);
    expect(urls).toContain("https://bringatrailer.com/listing/1995-ferrari-f355-gts-6-speed/");
    expect(urls).toContain("https://bringatrailer.com/listing/1997-ferrari-f355-spider/");
    expect(urls).toHaveLength(2); // duplicate + nav + pagination links excluded
  });
});

describe("parseListingPage", () => {
  it("parses a sold listing's price, date, mileage, VIN, and location", () => {
    const html = readFixture("bat-listing-sold.html");
    const result = parseListingPage(html, "https://bringatrailer.com/listing/1995-ferrari-f355-gts-6-speed/");

    expect(result.title).toBe("1995 Ferrari F355 GTS 6-Speed");
    expect(result.status).toBe("SOLD");
    expect(result.salePrice).toBe(85000);
    expect(result.saleDate?.getFullYear()).toBe(2024);
    expect(result.mileage).toBe(32415);
    expect(result.vin).toBe("ZFFXR41A9S0104521");
    expect(result.location).toBe("Los Angeles, California");
    expect(result.imageUrl).toContain("example.jpg");
  });

  it("parses a reserve-not-met listing with a null sale price", () => {
    const html = readFixture("bat-listing-reserve-not-met.html");
    const result = parseListingPage(html, "https://bringatrailer.com/listing/2005-ferrari-f430-spider/");

    expect(result.status).toBe("RESERVE_NOT_MET");
    expect(result.salePrice).toBeNull();
    expect(result.mileage).toBe(18200);
    expect(result.vin).toBe("ZFFEW59A950123456");
  });
});
