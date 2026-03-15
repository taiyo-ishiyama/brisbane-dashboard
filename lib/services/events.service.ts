import { fetchJson } from "@/lib/http/fetcher";
import { BCC_EVENTS_BASE_URL } from "@/config/sources";
import {
  normaliseBccEvents,
  buildDateRange,
  type BccEventsResponse,
} from "@/lib/normalizers/bccEvents";
import type { EventsNext7Days } from "@/types/events";

const EVENTS_LIMIT = 100;

export async function fetchEvents(): Promise<EventsNext7Days> {
  const { from, to } = buildDateRange();

  // Fetch events whose end_datetime falls on or after today AND
  // start_datetime falls on or before today+7 days (captures ongoing events).
  const where = `end_datetime>='${from}' AND start_datetime<='${to}'`;
  const url =
    `${BCC_EVENTS_BASE_URL}?limit=${EVENTS_LIMIT}` +
    `&order_by=start_datetime` +
    `&where=${encodeURIComponent(where)}`;

  const raw = await fetchJson<BccEventsResponse>(url);
  return normaliseBccEvents(raw, from, to);
}
