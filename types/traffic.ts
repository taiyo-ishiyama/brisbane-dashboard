import type { Severity, SectionMeta, GeoPoint } from "./dashboard";

export type TrafficType =
  | "crash"
  | "roadworks"
  | "hazard"
  | "congestion"
  | "flooding"
  | "closure"
  | "other";

export interface TrafficIncident {
  id: string;
  type: TrafficType;
  severity: Severity;
  title: string;
  description?: string;

  locationText?: string;
  suburb?: string;

  point?: GeoPoint;
  affectedRoads?: string[];

  startedAt?: string;
  updatedAt?: string;
  sourceUrl?: string;
}

export interface TrafficIncidentsFeed {
  meta: SectionMeta;
  incidents: TrafficIncident[];
}
