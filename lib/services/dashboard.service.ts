import { getAllLatestSnapshots } from "@/lib/db/snapshots.repo";
import { Section } from "@/config/constants";
import type { BrisbaneDashboardFeed } from "@/types/dashboard";
import type { WeatherForecast7d } from "@/types/weather";
import type { EmergencyAlertsFeed, BomWarningsFeed } from "@/types/alerts";
import type { EventsNext7Days } from "@/types/events";
import type { TrafficIncidentsFeed } from "@/types/traffic";
import type { TransitAlertsFeed } from "@/types/transit";

const emptyMeta = { source: "", fetchedAt: "" };

export async function getDashboardFeed(): Promise<BrisbaneDashboardFeed> {
  const snapshots = await getAllLatestSnapshots();

  return {
    generatedAt: new Date().toISOString(),
    header: {
      city: "Brisbane",
      timezone: "Australia/Brisbane",
    },
    emergency: (snapshots[Section.Emergency] as EmergencyAlertsFeed) ?? {
      meta: emptyMeta,
      alerts: [],
    },
    bomWarnings: (snapshots[Section.BomWarnings] as BomWarningsFeed) ?? {
      meta: emptyMeta,
      warnings: [],
    },
    weather: (snapshots[Section.Weather] as WeatherForecast7d) ?? {
      meta: emptyMeta,
      location: {
        name: "Brisbane",
        timezone: "Australia/Brisbane",
        point: { lat: -27.47, lon: 153.03 },
      },
      days: [],
    },
    events: (snapshots[Section.Events] as EventsNext7Days) ?? {
      meta: emptyMeta,
      range: { from: "", to: "" },
      events: [],
    },
    traffic: (snapshots[Section.Traffic] as TrafficIncidentsFeed) ?? {
      meta: emptyMeta,
      incidents: [],
    },
    transit: (snapshots[Section.Transit] as TransitAlertsFeed) ?? {
      meta: emptyMeta,
      alerts: [],
    },
  };
}
