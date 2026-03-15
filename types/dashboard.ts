export type Severity = "info" | "minor" | "moderate" | "severe" | "extreme";

export interface SectionMeta {
  source: string;
  fetchedAt: string;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface BrisbaneDashboardFeed {
  generatedAt: string;

  header: {
    city: "Brisbane";
    timezone: "Australia/Brisbane";
  };

  emergency: import("./alerts").EmergencyAlertsFeed;
  bomWarnings: import("./alerts").BomWarningsFeed;
  weather: import("./weather").WeatherForecast7d;
  events: import("./events").EventsNext7Days;
  traffic: import("./traffic").TrafficIncidentsFeed;
  transit: import("./transit").TransitAlertsFeed;
}
