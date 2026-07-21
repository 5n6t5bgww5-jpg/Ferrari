import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CACHE_DIR = path.resolve(process.cwd(), "scraper/.cache");

interface CacheEntry {
  url: string;
  fetchedAt: number;
  status: number;
  body: string;
}

function keyFor(url: string): string {
  return createHash("sha256").update(url).digest("hex");
}

export async function readCache(url: string, ttlMs: number): Promise<CacheEntry | null> {
  try {
    const raw = await readFile(path.join(CACHE_DIR, `${keyFor(url)}.json`), "utf-8");
    const entry = JSON.parse(raw) as CacheEntry;
    if (Date.now() - entry.fetchedAt > ttlMs) return null;
    return entry;
  } catch {
    return null;
  }
}

export async function writeCache(entry: CacheEntry): Promise<void> {
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(path.join(CACHE_DIR, `${keyFor(entry.url)}.json`), JSON.stringify(entry), "utf-8");
}
