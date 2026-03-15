import type { EventCategory } from "@/types/events";

/**
 * Maps BCC event_type / primaryeventtype tags to our normalised categories.
 * Keys are lowercased for matching.
 */
export const BCC_TAG_TO_CATEGORY: Record<string, EventCategory> = {
  // arts
  art: "arts",
  creative: "arts",
  exhibitions: "arts",

  // music
  music: "music",
  "live music": "music",
  concerts: "music",

  // markets
  markets: "markets",

  // family
  "family events": "family",
  children: "family",
  kids: "family",

  // sport
  sport: "sport",
  "active and healthy": "sport",
  fitness: "sport",

  // food
  food: "food",

  // community
  community: "community",
  festivals: "community",
  workshops: "community",
  tours: "community",
  "classes and workshops": "community",
  libraries: "community",

  // tech
  tech: "tech",
  technology: "tech",
  digital: "tech",
};
