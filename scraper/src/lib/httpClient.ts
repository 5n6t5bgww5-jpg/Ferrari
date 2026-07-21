import robotsParser from "robots-parser";
import { readCache, writeCache } from "./cache";

export const USER_AGENT =
  "FerrariMarketDashboard/0.1 (+personal research project; contact: ripcordaff@gmail.com)";

const REQUEST_DELAY_MS = 3000;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const MAX_RETRIES = 2;

let lastRequestAt = 0;
const robotsCache = new Map<string, ReturnType<typeof robotsParser>>();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForRateLimit(): Promise<void> {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < REQUEST_DELAY_MS) {
    await sleep(REQUEST_DELAY_MS - elapsed);
  }
  lastRequestAt = Date.now();
}

async function getRobots(url: string): Promise<ReturnType<typeof robotsParser>> {
  const { origin } = new URL(url);
  const cached = robotsCache.get(origin);
  if (cached) return cached;

  const robotsUrl = `${origin}/robots.txt`;
  let body = "";
  try {
    await waitForRateLimit();
    const res = await fetch(robotsUrl, { headers: { "User-Agent": USER_AGENT } });
    if (res.ok) body = await res.text();
  } catch {
    // robots-parser treats an empty body as allow-all, so an unreachable robots.txt
    // does not block scraping here. Logged so a human can verify manually if needed.
    console.warn(`[httpClient] could not fetch ${robotsUrl}; treating as unavailable`);
  }
  const robots = robotsParser(robotsUrl, body);
  robotsCache.set(origin, robots);
  return robots;
}

export class DisallowedByRobotsError extends Error {
  constructor(url: string) {
    super(`robots.txt disallows fetching ${url}`);
    this.name = "DisallowedByRobotsError";
  }
}

/**
 * Fetches a URL respectfully: checks robots.txt, rate-limits sequential requests,
 * caches responses on disk, and backs off on 429/503 instead of retry-hammering.
 */
export async function fetchPage(url: string, opts: { useCache?: boolean } = {}): Promise<string> {
  const useCache = opts.useCache ?? true;

  if (useCache) {
    const cached = await readCache(url, CACHE_TTL_MS);
    if (cached) return cached.body;
  }

  const robots = await getRobots(url);
  if (robots && robots.isAllowed(url, USER_AGENT) === false) {
    throw new DisallowedByRobotsError(url);
  }

  let attempt = 0;
  for (;;) {
    await waitForRateLimit();
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });

    if (res.status === 429 || res.status === 503) {
      if (attempt >= MAX_RETRIES) {
        throw new Error(`Giving up on ${url} after ${attempt} retries (status ${res.status})`);
      }
      const retryAfterHeader = res.headers.get("Retry-After");
      const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : REQUEST_DELAY_MS * 2 ** attempt;
      attempt += 1;
      await sleep(Number.isFinite(retryAfterMs) ? retryAfterMs : REQUEST_DELAY_MS * 2 ** attempt);
      continue;
    }

    if (!res.ok) {
      throw new Error(`Fetch failed for ${url}: HTTP ${res.status}`);
    }

    const body = await res.text();
    if (useCache) {
      await writeCache({ url, fetchedAt: Date.now(), status: res.status, body });
    }
    return body;
  }
}
