# Ferrari Market Dashboard

Tracks the Ferrari secondary/resale market by model: historical sale prices, recent
price changes, and trend tracking — sourced from public Bring a Trailer (BaT)
auction results.

"Live" here means **periodic refresh**, not push/websocket real-time: a scheduled
scraper re-crawls BaT on a cron, and the dashboard reflects the latest completed
run. Sold-auction prices don't change faster than that anyway.

## Stack

Next.js (App Router, TypeScript) + Prisma + SQLite + Tailwind + Recharts. A single
app — Server Components query Prisma directly, no separate API layer.

## ⚠️ Important: scraper selectors are unverified against the live site

This project was built in a sandboxed environment whose network egress policy
blocked outbound requests to `bringatrailer.com` (and every other non-allowlisted
host). **The BaT parser in `scraper/src/sources/bringATrailer.ts` and the
`batCategoryPath` URLs in `scraper/src/config/models.seed.ts` could not be checked
against a real page.**

To compensate, the scraper was designed to depend on the most stable things about
BaT rather than guessed CSS classes:

- It finds listing pages by scanning for `/listing/<slug>/` links (a URL shape that
  changes far less often than div class names), not by matching a specific
  card/grid selector.
- It reads price/date from the human-readable "Sold for $X on \<date\>" /
  "Bid to $X ... (Reserve Not Met)" phrasing, plus a `JSON-LD` price fallback,
  rather than a specific price-widget selector.
- Every model's `batCategoryPath` (e.g. `ferrari/458-italia`) is a **best-effort
  guess** at BaT's URL structure and needs to be checked against the real site.

**Before relying on scraped data**, run `npm run scrape -- --dry-run` (see below)
somewhere with real internet access — locally, or by triggering the
`Scrape Ferrari market data` GitHub Actions workflow manually — and check the
console output for parsing failures or a high unmatched-title count. Fix any
selector/URL drift you find; the parsing logic is intentionally isolated in
`scraper/src/sources/bringATrailer.ts` so this should be a small, local fix.

## Getting started

```bash
npm install
cp .env.example .env         # DATABASE_URL=file:./prisma/dev.db
npx prisma migrate deploy    # create the SQLite DB
npm run db:seed              # load the tracked Ferrari models (no sale data yet)
npm run dev                  # http://localhost:3000
```

The dashboard works with zero sale data — it just shows every tracked model with
an empty state until a scrape populates `SaleRecord` rows.

## Scraper

```bash
npm run scrape -- --dry-run   # parse + match only, no DB writes, prints a sample
npm run scrape                # scrape, upsert SaleRecord rows, recompute ModelStat
```

Respectful-scraping behavior (see `scraper/src/lib/httpClient.ts`):

- Descriptive `User-Agent` identifying this as a personal research project.
- Checks `robots.txt` before every request (`robots-parser`) and skips disallowed
  URLs.
- Sequential requests only, with a fixed delay between them — no concurrency, no
  hammering.
- On-disk response cache (`scraper/.cache/`, gitignored) so repeated dev runs
  don't re-hit the site.
- Backs off and gives up (rather than retry-hammering) on repeated 429/503s.

Please review Bring a Trailer's Terms of Service yourself before running this on
a schedule, and keep volume low — this is meant for a personal dashboard covering
a few dozen pages per run, not continuous crawling.

Unmatched listing titles (a title that doesn't match any configured model) are
still stored, with `modelId: null`, and logged to the console — add an alias or
`matchPattern` to `scraper/src/config/models.seed.ts` to fix a miss rather than
losing the data.

## Scheduling & deployment

`.github/workflows/scrape.yml` runs the scraper every 6 hours (and on manual
`workflow_dispatch`), then commits the updated `prisma/dev.db` back to the
repository. Connect the repo to Vercel (or any host that redeploys on push) and
each scrape's data update will go live on the next deploy.

To wire this up:

1. Push this repo to GitHub (already done if you're reading this from there).
2. Connect it to a Vercel project (or your host of choice) with auto-deploy on
   push to your default branch.
3. Trigger the `Scrape Ferrari market data` workflow once manually
   (Actions tab → *Run workflow*) to populate real data and confirm the
   commit + redeploy loop works end to end.

## Tests

```bash
npm test
```

Model-matching and BaT-parsing tests run against hand-built fixtures in
`scraper/fixtures/` (clearly marked as synthetic, not captured from a live page —
see the caveat above) so they don't depend on network access.

## MVP scope

Tracking 14 Ferrari models spanning the 308 through F8 Tributo era (see
`scraper/src/config/models.seed.ts`) from Bring a Trailer only. Deferred:
Cars & Bids and RM Sotheby's scrapers, VIN-based cross-source dedup, an
unmatched-title review UI, and older/classic models.
