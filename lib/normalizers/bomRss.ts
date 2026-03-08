import { XMLParser } from "fast-xml-parser";
import type { WeatherWarning, BomWarningsFeed } from "@/types/alerts";
import type { SectionMeta, Severity } from "@/types/dashboard";

interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  guid: string | { "#text": string };
}

interface RssFeed {
  rss: {
    channel: {
      item?: RssItem | RssItem[];
    };
  };
}

const parser = new XMLParser({
  ignoreAttributes: false,
  isArray: (_name, jpath) => jpath === "rss.channel.item",
});

/**
 * Strip the BoM timestamp prefix from warning titles.
 * Format: "DD/HH:MM EST " (e.g. "08/16:55 EST ")
 */
function cleanTitle(title: string): string {
  return title
    .replace(/^\d{2}\/\d{2}:\d{2}\s+[A-Z]+\s+/, "") // strip timestamp prefix
    .replace(/\s+/g, " ") // collapse whitespace/newlines
    .trim();
}

function deriveSeverity(title: string): Severity {
  const upper = title.toUpperCase();
  if (upper.includes("MAJOR") || upper.includes("SEVERE")) return "severe";
  if (upper.includes("MODERATE")) return "moderate";
  if (upper.includes("MINOR")) return "minor";
  if (upper.includes("CANCELLATION") || upper.includes("FINAL")) return "info";
  return "info";
}

function extractGuid(guid: string | { "#text": string }): string {
  return typeof guid === "string" ? guid : guid["#text"];
}

function toWarning(item: RssItem): WeatherWarning {
  const cleanedTitle = cleanTitle(item.title);
  return {
    id: extractGuid(item.guid),
    title: cleanedTitle,
    severity: deriveSeverity(cleanedTitle),
    issuedAt: new Date(item.pubDate).toISOString(),
    sourceName: "BOM",
    sourceUrl: item.link,
  };
}

export function normaliseBomRss(xml: string): BomWarningsFeed {
  const parsed = parser.parse(xml) as RssFeed;
  const items = parsed.rss.channel.item ?? [];
  const itemArray = Array.isArray(items) ? items : [items];

  const meta: SectionMeta = {
    source: "Bureau of Meteorology",
    fetchedAt: new Date().toISOString(),
  };

  const warnings = itemArray.map(toWarning);

  // Sort most recent first
  warnings.sort(
    (a, b) =>
      new Date(b.issuedAt!).getTime() - new Date(a.issuedAt!).getTime(),
  );

  return { meta, warnings };
}
