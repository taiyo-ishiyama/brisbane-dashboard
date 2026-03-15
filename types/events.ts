import type { SectionMeta, GeoPoint } from "./dashboard";

export type EventCategory =
  | "markets"
  | "family"
  | "music"
  | "arts"
  | "community"
  | "sport"
  | "food"
  | "tech"
  | "other";

export interface EventItem {
  id: string;
  title: string;
  descriptionShort?: string;
  startAt: string;
  endAt?: string;
  allDay?: boolean;

  venueName?: string;
  suburb?: string;
  address?: string;

  point?: GeoPoint;
  sourceUrl?: string;

  categories: EventCategory[];
  isFree?: boolean;
  imageUrl?: string;
}

export interface EventsNext7Days {
  meta: SectionMeta;
  range: { from: string; to: string };
  events: EventItem[];
}
