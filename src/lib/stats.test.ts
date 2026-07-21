import { describe, expect, it } from "vitest";
import { computeWindowStats, rollingAverage, type SoldSale } from "./stats";

const day = (offsetDays: number, now: Date) => new Date(now.getTime() - offsetDays * 24 * 60 * 60 * 1000);

describe("computeWindowStats", () => {
  it("computes avg/median/count for sales within the window", () => {
    const now = new Date("2026-07-21T00:00:00Z");
    const sales: SoldSale[] = [
      { salePrice: 100_000, saleDate: day(1, now) },
      { salePrice: 120_000, saleDate: day(5, now) },
      { salePrice: 110_000, saleDate: day(10, now) },
    ];
    const result = computeWindowStats(sales, 30, now);
    expect(result?.count).toBe(3);
    expect(result?.avgPrice).toBe(110_000);
    expect(result?.medianPrice).toBe(110_000);
  });

  it("computes % change against the prior equal-length window", () => {
    const now = new Date("2026-07-21T00:00:00Z");
    const sales: SoldSale[] = [
      { salePrice: 110_000, saleDate: day(5, now) }, // current 30d window
      { salePrice: 100_000, saleDate: day(45, now) }, // prior 30d window
    ];
    const result = computeWindowStats(sales, 30, now);
    expect(result?.avgPrice).toBe(110_000);
    expect(result?.pctChange).toBeCloseTo(10, 5);
  });

  it("returns null when there are no sales in the window", () => {
    const now = new Date("2026-07-21T00:00:00Z");
    const sales: SoldSale[] = [{ salePrice: 100_000, saleDate: day(400, now) }];
    expect(computeWindowStats(sales, 30, now)).toBeNull();
  });

  it("returns null pctChange when there's no prior-window data", () => {
    const now = new Date("2026-07-21T00:00:00Z");
    const sales: SoldSale[] = [{ salePrice: 100_000, saleDate: day(1, now) }];
    const result = computeWindowStats(sales, 30, now);
    expect(result?.pctChange).toBeNull();
  });
});

describe("rollingAverage", () => {
  it("computes a trailing average ordered by date", () => {
    const now = new Date("2026-07-21T00:00:00Z");
    const sales: SoldSale[] = [
      { salePrice: 100, saleDate: day(30, now) },
      { salePrice: 200, saleDate: day(20, now) },
      { salePrice: 300, saleDate: day(10, now) },
    ];
    const result = rollingAverage(sales, 2);
    expect(result[0].average).toBe(100);
    expect(result[1].average).toBe(150);
    expect(result[2].average).toBe(250);
  });
});
