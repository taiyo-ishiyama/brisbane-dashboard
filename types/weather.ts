import type { SectionMeta, GeoPoint } from "./dashboard";

export type WeatherIcon =
  | "clear"
  | "partly_cloudy"
  | "cloudy"
  | "fog"
  | "rain"
  | "showers"
  | "storm"
  | "hail"
  | "wind"
  | "unknown";

export interface ForecastDay {
  date: string;
  icon: WeatherIcon;
  tempMaxC: number;
  tempMinC: number;
  precipitationChancePct?: number;
  precipitationMm?: number;
  windMaxKph?: number;
  windDirDeg?: number;
}

export interface WeatherForecast7d {
  meta: SectionMeta;
  location: {
    name: "Brisbane";
    timezone: "Australia/Brisbane";
    point: GeoPoint;
  };
  days: ForecastDay[];
}
