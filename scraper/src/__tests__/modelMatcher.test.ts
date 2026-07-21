import { describe, expect, it } from "vitest";
import { matchTitle, type MatchableModel } from "../lib/modelMatcher";
import { FERRARI_MODEL_SEEDS } from "../config/models.seed";

const models: MatchableModel[] = FERRARI_MODEL_SEEDS.map((seed, i) => ({
  id: `id-${i}`,
  slug: seed.slug,
  matchPatterns: JSON.stringify(seed.matchPatterns),
}));

function idFor(slug: string): string {
  const index = FERRARI_MODEL_SEEDS.findIndex((s) => s.slug === slug);
  return `id-${index}`;
}

describe("matchTitle", () => {
  it("extracts the leading year and matches an exact model", () => {
    const result = matchTitle("1995 Ferrari F355 GTS", models);
    expect(result.year).toBe(1995);
    expect(result.modelId).toBe(idFor("f355"));
  });

  it("matches 308 vs 328 distinctly", () => {
    expect(matchTitle("1985 Ferrari 308 GTS QV", models).modelId).toBe(idFor("308-328"));
    expect(matchTitle("1988 Ferrari 328 GTS", models).modelId).toBe(idFor("308-328"));
  });

  it("matches 575M without confusing it for 550", () => {
    expect(matchTitle("2003 Ferrari 575M Maranello", models).modelId).toBe(idFor("575m-maranello"));
    expect(matchTitle("1998 Ferrari 550 Maranello", models).modelId).toBe(idFor("550-maranello"));
  });

  it("matches California and California T to the same model", () => {
    expect(matchTitle("2010 Ferrari California", models).modelId).toBe(idFor("california"));
    expect(matchTitle("2016 Ferrari California T", models).modelId).toBe(idFor("california"));
  });

  it("strips noise phrases without affecting the match", () => {
    const result = matchTitle("2012 Ferrari 458 Italia No Reserve 1-Owner", models);
    expect(result.modelId).toBe(idFor("458-italia"));
  });

  it("returns a null modelId with the extracted year for unrecognized titles", () => {
    const result = matchTitle("1962 Ferrari 250 GTO", models);
    expect(result.modelId).toBeNull();
    expect(result.year).toBe(1962);
  });

  it("returns a null year when no leading year is present", () => {
    const result = matchTitle("Ferrari F430 Spider", models);
    expect(result.year).toBeNull();
    expect(result.modelId).toBe(idFor("f430"));
  });
});
