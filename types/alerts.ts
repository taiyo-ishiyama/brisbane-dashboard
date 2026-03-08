import type { Severity, SectionMeta } from "./dashboard";

export interface WeatherWarning {
  id: string;
  title: string;
  summary?: string;
  severity: Severity;
  areas?: string[];
  issuedAt?: string;
  updatedAt?: string;
  sourceName: "BOM";
  sourceUrl: string;
}

export interface BomWarningsFeed {
  meta: SectionMeta;
  warnings: WeatherWarning[];
}

export interface EmergencyAlert {
  id: string;
  title: string;
  summary?: string;
  severity: Severity;
  category?: string;
  areas?: string[];
  issuedAt?: string;
  updatedAt?: string;
  sourceName: "Queensland Disaster";
  sourceUrl: string;
}

export interface EmergencyAlertsFeed {
  meta: SectionMeta;
  alerts: EmergencyAlert[];
}
