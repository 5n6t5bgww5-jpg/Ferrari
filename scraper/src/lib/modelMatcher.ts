export interface MatchableModel {
  id: string;
  slug: string;
  /** JSON-encoded string[] of regex patterns, most-specific first. */
  matchPatterns: string;
}

export interface TitleMatch {
  modelId: string | null;
  year: number | null;
}

const LEADING_YEAR = /^\s*(19|20)\d{2}\b/;
const NOISE_PHRASES = [
  /\bno reserve\b/gi,
  /\b1[-\s]owner\b/gi,
  /\bsingle[-\s]owner\b/gi,
  /\blow[-\s]mile(age|s)?\b/gi,
];

function extractYear(title: string): number | null {
  const match = title.match(LEADING_YEAR);
  return match ? Number(match[0]) : null;
}

function stripNoise(title: string): string {
  let result = title;
  for (const phrase of NOISE_PHRASES) {
    result = result.replace(phrase, "");
  }
  return result;
}

/**
 * Matches a free-text listing title (e.g. "1995 Ferrari F355 GTS") against the
 * configured models. Models are expected pre-sorted so the most specific pattern
 * set is tried first; the first pattern that matches wins.
 */
export function matchTitle(title: string, models: MatchableModel[]): TitleMatch {
  const year = extractYear(title);
  const cleaned = stripNoise(title);

  for (const model of models) {
    const patterns: string[] = JSON.parse(model.matchPatterns);
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, "i");
      if (regex.test(cleaned)) {
        return { modelId: model.id, year };
      }
    }
  }

  return { modelId: null, year };
}
