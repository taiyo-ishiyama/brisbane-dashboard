export const BRISBANE_TZ = "Australia/Brisbane" as const;

export const Section = {
  Weather: "weather",
  Events: "events",
  Traffic: "traffic",
  Transit: "transit",
  BomWarnings: "bomWarnings",
  Emergency: "emergency",
} as const;

export type SectionName = (typeof Section)[keyof typeof Section];

export const FETCH_TIMEOUT_MS = 10_000;
export const FETCH_RETRIES = 2;
