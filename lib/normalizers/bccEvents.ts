import type { EventItem, EventCategory, EventsNext7Days } from "@/types/events";
import type { SectionMeta } from "@/types/dashboard";
import { BCC_TAG_TO_CATEGORY } from "@/config/categories";
import { BRISBANE_TZ } from "@/config/constants";

/** Shape of a single record from the BCC OpenDataSoft API v2.1 */
export interface BccEventRecord {
  subject: string;
  web_link?: string;
  location?: string;
  start_datetime: string;
  end_datetime?: string;
  description?: string;
  event_type?: string[];
  primaryeventtype?: string;
  cost?: string;
  eventimage?: string;
  venue?: string;
  venueaddress?: string;
  geolocation?: { lat: number; lon: number } | null;
}

export interface BccEventsResponse {
  total_count: number;
  results: BccEventRecord[];
}

function extractEventId(webLink?: string): string | undefined {
  if (!webLink) return undefined;
  const match = webLink.match(/eventid%3d(\d+)/i);
  return match?.[1];
}

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "event";
}

function buildEventUrl(title: string, eventId: string): string {
  return `https://www.brisbane.qld.gov.au/events/${slugify(title)}/${eventId}`;
}

function mapCategories(record: BccEventRecord): EventCategory[] {
  const tags = [
    ...(record.event_type ?? []),
    record.primaryeventtype,
  ].filter(Boolean) as string[];

  const cats = new Set<EventCategory>();
  for (const tag of tags) {
    const mapped = BCC_TAG_TO_CATEGORY[tag.toLowerCase()];
    if (mapped) cats.add(mapped);
  }

  return cats.size > 0 ? [...cats] : ["other"];
}

function isFree(cost?: string): boolean | undefined {
  if (!cost) return undefined;
  return cost.toLowerCase().trim() === "free";
}

function extractSuburb(location?: string, venue?: string): string | undefined {
  const loc = venue ?? location;
  if (!loc) return undefined;
  const parts = loc.split(",").map((s) => s.trim());
  return parts.length > 1 ? parts[parts.length - 1] : undefined;
}

function truncateDescription(desc?: string, maxLen = 150): string | undefined {
  if (!desc) return undefined;
  // Strip HTML tags
  const plain = desc.replace(/<[^>]*>/g, "").trim();
  if (plain.length <= maxLen) return plain;
  return plain.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

function toRecord(record: BccEventRecord): EventItem {
  const parsedId = extractEventId(record.web_link);
  const id = parsedId ?? crypto.randomUUID();
  return {
    id,
    title: record.subject,
    descriptionShort: truncateDescription(record.description),
    startAt: record.start_datetime,
    endAt: record.end_datetime ?? undefined,
    venueName: record.venue ?? record.location ?? undefined,
    suburb: extractSuburb(record.location, record.venue),
    address: record.venueaddress ?? undefined,
    point: record.geolocation
      ? { lat: record.geolocation.lat, lon: record.geolocation.lon }
      : undefined,
    sourceUrl: record.web_link
      ? parsedId
        ? buildEventUrl(record.subject, parsedId)
        : record.web_link
      : undefined,
    categories: mapCategories(record),
    isFree: isFree(record.cost),
    imageUrl: record.eventimage ?? undefined,
  };
}

export function normaliseBccEvents(
  raw: BccEventsResponse,
  from: string,
  to: string,
): EventsNext7Days {
  const meta: SectionMeta = {
    source: "BCC Events",
    fetchedAt: new Date().toISOString(),
  };

  const events = raw.results.map(toRecord);

  // Sort soonest first
  events.sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );

  return {
    meta,
    range: { from, to },
    events,
  };
}

/** Build the date range for the next 7 days in Brisbane timezone. */
export function buildDateRange(): { from: string; to: string } {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: BRISBANE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const from = fmt.format(now);

  const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const to = fmt.format(future);

  return { from, to };
}
