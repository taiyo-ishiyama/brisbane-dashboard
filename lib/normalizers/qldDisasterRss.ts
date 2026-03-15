import { XMLParser } from "fast-xml-parser";
import type { EmergencyAlert, EmergencyAlertsFeed } from "@/types/alerts";
import type { SectionMeta, Severity } from "@/types/dashboard";

interface AtomEntry {
  title: string;
  summary?: string;
  link?: string | { "@_href": string };
  id: string;
  updated: string;
  "georss:point"?: string;
}

interface AtomFeed {
  feed: {
    entry?: AtomEntry | AtomEntry[];
  };
}

const parser = new XMLParser({
  ignoreAttributes: false,
  isArray: (_name, jpath) => jpath === "feed.entry",
});

function deriveSeverity(title: string): Severity {
  const upper = title.toUpperCase();
  if (upper.includes("EMERGENCY WARNING")) return "extreme";
  if (upper.includes("WATCH AND ACT")) return "severe";
  if (upper.includes("ADVICE")) return "moderate";
  return "info";
}

function deriveCategory(title: string): string | undefined {
  const lower = title.toLowerCase();
  if (lower.includes("bushfire") || lower.includes("fire")) return "Bushfire";
  if (lower.includes("cyclone")) return "Cyclone";
  if (lower.includes("flood")) return "Flood";
  if (lower.includes("storm") || lower.includes("severe weather"))
    return "Severe Weather";
  if (lower.includes("heat")) return "Extreme Heat";
  return undefined;
}

function extractLink(
  link: string | { "@_href": string } | undefined,
): string {
  if (!link) return "";
  return typeof link === "string" ? link : link["@_href"];
}

function toAlert(entry: AtomEntry): EmergencyAlert {
  const title = entry.title.replace(/\s+/g, " ").trim();
  return {
    id: entry.id,
    title,
    summary: entry.summary?.replace(/\s+/g, " ").trim(),
    severity: deriveSeverity(title),
    category: deriveCategory(title),
    issuedAt: new Date(entry.updated).toISOString(),
    sourceName: "Queensland Disaster",
    sourceUrl: extractLink(entry.link),
  };
}

export function normaliseQldDisasterRss(xml: string): EmergencyAlertsFeed {
  const parsed = parser.parse(xml) as AtomFeed;
  const entries = parsed.feed.entry ?? [];
  const entryArray = Array.isArray(entries) ? entries : [entries];

  const meta: SectionMeta = {
    source: "Queensland Disaster",
    fetchedAt: new Date().toISOString(),
  };

  const alerts = entryArray.map(toAlert);

  // Sort most recent first
  alerts.sort(
    (a, b) =>
      new Date(b.issuedAt!).getTime() - new Date(a.issuedAt!).getTime(),
  );

  return { meta, alerts };
}
