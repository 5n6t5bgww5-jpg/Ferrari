// Single source of truth for tracked Ferrari models: shared by prisma/seed.ts
// (loads these into FerrariModel rows) and the scraper's model matcher
// (matches free-text listing titles against matchPatterns, most-specific first).
export interface FerrariModelSeed {
  slug: string;
  name: string;
  series?: string;
  yearStart: number;
  yearEnd?: number;
  bodyStyles: string[];
  aliases: string[];
  /** Regex source strings, ordered most-specific first. Matched case-insensitively. */
  matchPatterns: string[];
  /**
   * Path segment of this model's Bring a Trailer results page, e.g.
   * "ferrari/458-italia" for https://bringatrailer.com/ferrari/458-italia/.
   * BEST-EFFORT GUESS: this could not be verified against the live site from
   * the sandbox this project was built in (outbound network access to
   * bringatrailer.com was blocked by the environment's egress policy).
   * Verify each path against the real site before relying on scraped data —
   * see scraper/README.md.
   */
  batCategoryPath: string;
}

export const FERRARI_MODEL_SEEDS: FerrariModelSeed[] = [
  {
    slug: "308-328",
    name: "308/328 GTB/GTS",
    series: "308/328 Series",
    yearStart: 1975,
    yearEnd: 1989,
    bodyStyles: ["GTB", "GTS", "GTSi", "QV"],
    aliases: ["308", "328", "308 GTB", "308 GTS", "328 GTB", "328 GTS", "308 GTSi", "308 QV"],
    matchPatterns: ["\\b328\\s?(GTB|GTS)?\\b", "\\b308\\s?(GTB|GTS|GTSi|QV)?\\b"],
    batCategoryPath: "ferrari/308",
  },
  {
    slug: "testarossa",
    name: "Testarossa",
    series: "Testarossa/512",
    yearStart: 1984,
    yearEnd: 1996,
    bodyStyles: ["Berlinetta"],
    aliases: ["Testarossa", "512 TR", "512M", "512 M"],
    matchPatterns: ["\\b512\\s?M\\b", "\\b512\\s?TR\\b", "\\bTestarossa\\b"],
    batCategoryPath: "ferrari/testarossa",
  },
  {
    slug: "348",
    name: "348",
    series: "348 Series",
    yearStart: 1989,
    yearEnd: 1995,
    bodyStyles: ["tb", "ts", "Spider"],
    aliases: ["348", "348 tb", "348 ts", "348 Spider"],
    matchPatterns: ["\\b348\\s?(tb|ts|Spider)?\\b"],
    batCategoryPath: "ferrari/348",
  },
  {
    slug: "f355",
    name: "F355",
    series: "F355 Series",
    yearStart: 1994,
    yearEnd: 1999,
    bodyStyles: ["Berlinetta", "GTS", "Spider"],
    aliases: ["F355", "355", "F355 Berlinetta", "F355 GTS", "F355 Spider"],
    matchPatterns: ["\\bF?355\\s?(Berlinetta|GTS|Spider)?\\b"],
    batCategoryPath: "ferrari/355",
  },
  {
    slug: "360-modena",
    name: "360 Modena",
    series: "360 Series",
    yearStart: 1999,
    yearEnd: 2005,
    bodyStyles: ["Modena", "Spider", "Challenge Stradale"],
    aliases: ["360 Modena", "360 Spider", "360 Challenge Stradale", "360 CS"],
    matchPatterns: ["\\b360\\s?(Modena|Spider|Challenge Stradale|CS)?\\b"],
    batCategoryPath: "ferrari/360-modena",
  },
  {
    slug: "f430",
    name: "F430",
    series: "F430 Series",
    yearStart: 2004,
    yearEnd: 2009,
    bodyStyles: ["Berlinetta", "Spider", "Scuderia"],
    aliases: ["F430", "430 Scuderia", "F430 Spider", "430 Scuderia 16M"],
    matchPatterns: ["\\bF?430\\s?(Scuderia\\s?16M|Scuderia|Spider)?\\b"],
    batCategoryPath: "ferrari/f430",
  },
  {
    slug: "550-maranello",
    name: "550 Maranello",
    series: "550/575 Series",
    yearStart: 1996,
    yearEnd: 2001,
    bodyStyles: ["Berlinetta", "Barchetta"],
    aliases: ["550 Maranello", "550 Barchetta"],
    matchPatterns: ["\\b550\\s?(Maranello|Barchetta)?\\b"],
    batCategoryPath: "ferrari/550-maranello",
  },
  {
    slug: "575m-maranello",
    name: "575M Maranello",
    series: "550/575 Series",
    yearStart: 2002,
    yearEnd: 2006,
    bodyStyles: ["Berlinetta", "Superamerica"],
    aliases: ["575M", "575 Maranello", "575 Superamerica"],
    matchPatterns: ["\\b575\\s?M?\\s?(Maranello|Superamerica)?\\b"],
    batCategoryPath: "ferrari/575m-maranello",
  },
  {
    slug: "599-gtb-fiorano",
    name: "599 GTB Fiorano",
    series: "599 Series",
    yearStart: 2006,
    yearEnd: 2012,
    bodyStyles: ["Berlinetta", "GTO", "SA Aperta"],
    aliases: ["599 GTB", "599 GTO", "599 SA Aperta"],
    matchPatterns: ["\\b599\\s?(GTB|GTO|SA Aperta|Fiorano)?\\b"],
    batCategoryPath: "ferrari/599-gtb-fiorano",
  },
  {
    slug: "california",
    name: "California",
    series: "California Series",
    yearStart: 2008,
    yearEnd: 2017,
    bodyStyles: ["Convertible"],
    aliases: ["California", "California T"],
    matchPatterns: ["\\bCalifornia\\s?T?\\b"],
    batCategoryPath: "ferrari/california",
  },
  {
    slug: "portofino",
    name: "Portofino",
    series: "Portofino Series",
    yearStart: 2017,
    yearEnd: 2023,
    bodyStyles: ["Convertible"],
    aliases: ["Portofino", "Portofino M"],
    matchPatterns: ["\\bPortofino\\s?M?\\b"],
    batCategoryPath: "ferrari/portofino",
  },
  {
    slug: "458-italia",
    name: "458 Italia",
    series: "458 Series",
    yearStart: 2009,
    yearEnd: 2015,
    bodyStyles: ["Italia", "Spider", "Speciale"],
    aliases: ["458 Italia", "458 Spider", "458 Speciale"],
    matchPatterns: ["\\b458\\s?(Italia|Spider|Speciale)?\\b"],
    batCategoryPath: "ferrari/458-italia",
  },
  {
    slug: "488-gtb",
    name: "488 GTB/Spider",
    series: "488 Series",
    yearStart: 2015,
    yearEnd: 2019,
    bodyStyles: ["GTB", "Spider", "Pista"],
    aliases: ["488 GTB", "488 Spider", "488 Pista"],
    matchPatterns: ["\\b488\\s?(GTB|Spider|Pista)?\\b"],
    batCategoryPath: "ferrari/488-gtb",
  },
  {
    slug: "f8-tributo",
    name: "F8 Tributo",
    series: "F8 Series",
    yearStart: 2019,
    yearEnd: 2022,
    bodyStyles: ["Tributo", "Spider"],
    aliases: ["F8 Tributo", "F8 Spider"],
    matchPatterns: ["\\bF8\\s?(Tributo|Spider)?\\b"],
    batCategoryPath: "ferrari/f8-tributo",
  },
];
