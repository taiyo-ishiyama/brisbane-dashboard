import type { Severity, SectionMeta } from "./dashboard";

export type TransitMode = "train" | "bus" | "ferry" | "tram" | "other";

export interface TransitAlert {
  id: string;
  severity: Severity;
  headline: string;
  description?: string;

  modes?: TransitMode[];
  routes?: string[];
  stops?: string[];

  activeFrom?: string;
  activeTo?: string;

  sourceName: "TransLink";
  sourceUrl?: string;
}

export interface TransitAlertsFeed {
  meta: SectionMeta;
  alerts: TransitAlert[];
}
