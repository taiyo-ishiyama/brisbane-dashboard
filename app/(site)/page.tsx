import Header from "@/components/layout/Header";
import AlertsBanner from "@/components/dashboard/AlertsBanner";
import WeatherForecast from "@/components/dashboard/WeatherForecast";
import EventsPanel from "@/components/dashboard/EventsPanel";
import DisruptionsPanel from "@/components/dashboard/DisruptionsPanel";
import { Muted } from "@/components/ui/Typography";
import type { EmergencyAlertsFeed } from "@/types/alerts";
import type { WeatherForecast7d } from "@/types/weather";
import type { EventsNext7Days } from "@/types/events";
import type { TrafficIncidentsFeed } from "@/types/traffic";
import type { TransitAlertsFeed } from "@/types/transit";

/* ─── Placeholder data ──────────────────────────────────────────────── */

const now = new Date().toISOString();

const emergencyData: EmergencyAlertsFeed = {
  meta: { source: "qld-disaster", fetchedAt: now },
  alerts: [
    {
      id: "alert-1",
      title: "Severe Thunderstorm Warning — South East QLD",
      summary:
        "Damaging winds and large hailstones expected. Source: BOM.",
      severity: "severe",
      category: "storm",
      areas: ["Brisbane", "Gold Coast", "Ipswich"],
      issuedAt: now,
      sourceName: "Queensland Disaster",
      sourceUrl: "https://www.disaster.qld.gov.au",
    },
  ],
};

function makeDays() {
  const icons = [
    "storm",
    "partly_cloudy",
    "clear",
    "rain",
    "partly_cloudy",
    "clear",
    "cloudy",
  ] as const;
  const highs = [28, 29, 26, 24, 25, 27, 26];
  const lows = [21, 19, 18, 17, 18, 20, 19];
  const rain = [80, 20, 0, 60, 10, 0, 30];
  const wind = [35, 20, 15, 25, 18, 12, 22];

  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toLocaleDateString("en-CA", {
      timeZone: "Australia/Brisbane",
    });
    return {
      date: dateStr,
      icon: icons[i],
      tempMaxC: highs[i],
      tempMinC: lows[i],
      precipitationChancePct: rain[i],
      windMaxKph: wind[i],
    };
  });
}

const weatherData: WeatherForecast7d = {
  meta: { source: "open-meteo", fetchedAt: now },
  location: {
    name: "Brisbane",
    timezone: "Australia/Brisbane",
    point: { lat: -27.47, lon: 153.03 },
  },
  days: makeDays(),
};

const eventsData: EventsNext7Days = {
  meta: { source: "bcc-events", fetchedAt: now },
  range: { from: now, to: new Date(Date.now() + 7 * 86400000).toISOString() },
  events: [
    {
      id: "evt-1",
      title: "Collective Markets",
      descriptionShort:
        "Explore a diverse range of local arts, crafts, fashion, collectables, exotic wares, and designers.",
      startAt: new Date(Date.now() + 86400000).toISOString(),
      allDay: true,
      venueName: "South Bank",
      suburb: "South Brisbane",
      categories: ["markets"],
      isFree: true,
    },
    {
      id: "evt-2",
      title: "Riverside Picnic & Jazz",
      descriptionShort:
        "Bring a picnic blanket and enjoy a relaxing afternoon by the river with local jazz bands.",
      startAt: new Date(Date.now() + 2 * 86400000).toISOString(),
      venueName: "New Farm Park",
      suburb: "New Farm",
      categories: ["music", "community"],
      isFree: true,
    },
    {
      id: "evt-3",
      title: "Valley Live Series",
      descriptionShort:
        "Local indie bands take over the Mall for a night of high-energy performances. For events.",
      startAt: new Date(Date.now() + 3 * 86400000).toISOString(),
      venueName: "Brunswick Street Mall",
      suburb: "Fortitude Valley",
      categories: ["music"],
      isFree: false,
    },
    {
      id: "evt-4",
      title: "Brisbane Tech Meetup",
      descriptionShort:
        "Monthly gathering of tech enthusiasts. Talks on AI, web dev, and startup culture.",
      startAt: new Date(Date.now() + 4 * 86400000).toISOString(),
      venueName: "State Library",
      suburb: "South Brisbane",
      categories: ["tech", "community"],
      isFree: true,
    },
    {
      id: "evt-5",
      title: "Family Fun Day",
      descriptionShort:
        "Activities for all ages including face painting, rides, and live entertainment.",
      startAt: new Date(Date.now() + 5 * 86400000).toISOString(),
      venueName: "Roma Street Parkland",
      suburb: "Brisbane City",
      categories: ["family"],
      isFree: true,
    },
  ],
};

const trafficData: TrafficIncidentsFeed = {
  meta: { source: "qld-traffic", fetchedAt: now },
  incidents: [
    {
      id: "traf-1",
      type: "congestion",
      severity: "moderate",
      title: "M3 Riverside Expressway",
      description:
        "Heavy congestion southbound. Expect delays. Delay expected.",
      locationText: "M3, near QLD Gov. Centre",
    },
    {
      id: "traf-2",
      type: "crash",
      severity: "severe",
      title: "Gympie Road, Chermside",
      description:
        "Multi-vehicle incident northbound. Emergency services on site.",
      locationText: "Gympie Road",
    },
    {
      id: "traf-3",
      type: "roadworks",
      severity: "minor",
      title: "Coronation Drive",
      description:
        "Overnight lane closures due to works at Suncorp Stadium after today.",
      locationText: "Coronation Drive, Milton",
    },
    {
      id: "traf-4",
      type: "closure",
      severity: "moderate",
      title: "Victoria Bridge",
      description: "Closed to general traffic. Buses and active transport only.",
      locationText: "Victoria Bridge, CBD",
    },
  ],
};

const transitData: TransitAlertsFeed = {
  meta: { source: "translink-gtfsrt", fetchedAt: now },
  alerts: [
    {
      id: "tr-1",
      severity: "moderate",
      headline: "Beenleigh line — reduced service",
      description: "Trains running every 30 minutes due to track maintenance.",
      modes: ["train"],
      routes: ["Beenleigh"],
      sourceName: "TransLink",
    },
    {
      id: "tr-2",
      severity: "minor",
      headline: "Bus route 199 — detour via Roma St",
      description: "Temporary detour due to road works on Adelaide Street.",
      modes: ["bus"],
      routes: ["199"],
      sourceName: "TransLink",
    },
    {
      id: "tr-3",
      severity: "info",
      headline: "CityCat — normal operations",
      modes: ["ferry"],
      sourceName: "TransLink",
    },
  ],
};

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface">
      <Header />

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6">
        {/* Emergency alerts */}
        <AlertsBanner data={emergencyData} />

        {/* Weather */}
        <WeatherForecast data={weatherData} />

        {/* Events */}
        <EventsPanel data={eventsData} />

        {/* Disruptions */}
        <DisruptionsPanel
          traffic={trafficData}
          transit={transitData}
          fetchedAt={now}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center sm:px-6">
          <Muted>
            &copy; {new Date().getFullYear()} Brisbane Local Dashboard. Data
            sources: BOM, TransLink, Brisbane City Council.
          </Muted>
        </div>
      </footer>
    </div>
  );
}
