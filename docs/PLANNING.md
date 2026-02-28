# Brisbane Local Dashboard — Planning Document

---

## 1) Product Overview

**Goal:** Build a one-page Brisbane-focused web dashboard that helps users:

- Decide what to do (events)
- Understand what to watch out for (weather, transport/traffic disruptions)
- Get emergency alerts with appropriate emphasis

**Core idea:** Serverless ingestion pipeline regularly fetches official/open-data sources, normalises results into a stable schema, caches in Supabase, then frontend renders from a single fast `/api/feed` endpoint.

---

## 2) UX / Design Requirements (One Page)

### Global

- Responsive for desktop + mobile
- Calm, clean default appearance; urgent info gets strong emphasis
- Show Brisbane current time with seconds in header
- Each section shows "Last updated HH:MM" based on cached fetch time
- When no alerts/disruptions exist, show subtle "All clear / No active alerts" state (not empty panels)
- Prefer high-signal summaries + "view more" expansion to keep it one-page

### Header

- **Title:** "Brisbane Local Dashboard"
- **Clock:** "Brisbane time — HH:MM:SS" (client-side ticking)
- Optional later: location/radius, preferences

### Sections

#### Emergency Alerts (highest priority)

- If active alerts exist: top banner with high visibility
- If none: subtle status row: "No active alerts"
- Always show "Last updated HH:MM"

#### Weather (today + next 6 days)

- 7 cards (today highlighted)
- Show: icon (sun/cloud/rain), max/min, wind, rain chance
- Mobile: horizontal scroll
- "Last updated HH:MM"

#### Events (next 7 days)

- List cards sorted soonest-first
- Search box + filter chips: Free / Family / Music / Markets / Tech (initial tags)
- Show top N + "View more" expand
- "Last updated HH:MM"

#### Disruptions (Traffic + Public Transport)

- Desktop: two columns; Mobile: tabs/accordion
- Only show top 3–5 items per column with "view more"
- If empty: "All clear"
- "Last updated HH:MM"

---

## 3) Data Sources (APIs/Feeds Used)

| Section | Source | Notes |
|---|---|---|
| Weather forecast (7-day cards) | Open-Meteo | No key; simple daily forecast |
| Weather warnings (official) | Bureau of Meteorology (BoM) RSS | Warnings feed |
| Events (local, official) | Brisbane City Council (BCC) Events dataset | Via Brisbane open data portal (Trumba-derived) |
| Traffic incidents | QLDTraffic GeoJSON feeds | Hazards/incidents/roadworks/etc. |
| Public transport disruptions | TransLink GTFS-RT Service Alerts | Protobuf feed |
| Emergency alerts | Queensland Disaster Dashboard RSS | Current warnings/alerts |

---

## 4) Refresh / Pipeline Strategy

**Why not only daily for everything?**

- Events + 7-day forecast: daily is fine
- Alerts/disruptions/traffic: daily can become stale and feel unreliable

**Recommended cadence (keeps cost low):**

| Job | Cadence | Sources |
|---|---|---|
| Daily | Once per day | Weather forecast, events |
| Hourly | Every hour | BoM warnings, QLD disaster alerts, QLDTraffic incidents, TransLink service alerts |

Both jobs store normalised snapshots; frontend reads snapshots only.

---

## 5) Normalised Output Models (Frontend-Friendly)

Use stable models; UI never depends on raw feed formats.

### Shared Meta

- `meta.source`
- `meta.fetchedAt` (ISO)
- Optional `effectiveFrom` / `effectiveTo`

### Weather Forecast (Open-Meteo → normalised)

- `WeatherForecast7d { meta, location, days: ForecastDay[7] }`
- **ForecastDay includes:** `date`, `icon`, `tempMaxC`, `tempMinC`, `precipitationChancePct`, `windMaxKph`

### BoM Warnings (RSS → normalised)

- `BomWarningsFeed { meta, warnings: WeatherWarning[] }`

### QLD Disaster Alerts (RSS → normalised)

- `EmergencyAlertsFeed { meta, alerts: EmergencyAlert[] }`

### Events (BCC dataset → normalised)

- `EventsNext7Days { meta, range, events: EventItem[] }`
- **EventItem includes:**
  - `title`, `startAt`, optional `endAt`
  - `venueName` / `suburb` / `address`
  - `categories[]`, optional `isFree`, optional `sourceUrl`

### Traffic Incidents (QLDTraffic GeoJSON → normalised)

- `TrafficIncidentsFeed { meta, incidents: TrafficIncident[] }`
- **TrafficIncident includes:** `type`, `severity`, `title`, `locationText`, optional `point`

### Transit Alerts (TransLink GTFS-RT → normalised)

- `TransitAlertsFeed { meta, alerts: TransitAlert[] }`
- **TransitAlert includes:** `headline`, `description`, `routes`/`stops`, `activeFrom`/`activeTo`, `severity`

### Combined Payload (returned by `/api/feed`)

`BrisbaneDashboardFeed`:

- `emergency`, `bomWarnings`, `weather`, `events`, `traffic`, `transit`
- `generatedAt` and header info

---

## 6) Tech Stack (Final)

### Core

- Next.js (App Router) + TypeScript
- Vercel (Hobby) hosting
- Node.js serverless functions via `app/api/**/route.ts`
- Supabase (cloud Postgres)

### Frontend

- Tailwind CSS
- shadcn/ui
- lucide-react icons
- TanStack Query for client caching & loading states
- Framer Motion (optional) for subtle animations (banner entrance, expand/collapse)

### Backend Utilities

- Zod (env + response validation)
- fast-xml-parser for RSS parsing
- gtfs-realtime-bindings for GTFS-RT parsing
- Fetch wrapper with timeout/retry/backoff

### Testing / CI

- Vitest for unit tests (normalisers/services)
- Playwright for E2E (mocked data)
- GitHub Actions for CI (lint/typecheck/unit/e2e)

---

## 7) Deployment Model

- Vercel deploys Next.js site + API routes as serverless functions
- Supabase hosts DB (no local Docker needed for MVP)

**Vercel Cron triggers:**

- `POST /api/cron/daily`
- `POST /api/cron/hourly`

**Security for cron endpoints:**

- Use `CRON_SECRET` env var
- Cron routes require `x-cron-secret` header; reject if missing/incorrect
- Only `/api/feed` is public

---

## 8) Supabase Schema (Minimal)

### Table: `snapshots`

**Purpose:** Store cached normalised JSON per section.

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` | Primary key |
| `section` | `TEXT` | e.g. `weather`, `events`, `traffic`, `transit`, `bomWarnings`, `emergency` |
| `key` | `TEXT` | Use `latest` for current snapshot; optionally `YYYY-Www` for weekly |
| `fetched_at` | `TIMESTAMPTZ` | When the data was fetched |
| `payload` | `JSONB` | Normalised JSON payload |

**Indexes:** `(section, key)` unique (so upsert works)

**MVP approach:**

- Always upsert `key = 'latest'` per section
- `/api/feed` reads all latest snapshots and assembles a single response

---

## 9) API Routes (Next.js Route Handlers)

### Public

- **`GET /api/feed`** — Reads latest snapshots from Supabase. Returns one combined `BrisbaneDashboardFeed`.
- **`GET /api/health`** — Lightweight 200 response for CI smoke tests.

### Protected (cron)

- **`POST /api/cron/daily`** (requires `x-cron-secret`)
  - Fetch + normalise:
    - Open-Meteo 7-day forecast
    - BCC events next 7 days
  - Upsert snapshots in Supabase

- **`POST /api/cron/hourly`** (requires `x-cron-secret`)
  - Fetch + normalise:
    - BoM warnings RSS
    - QLD disaster alerts RSS
    - QLDTraffic GeoJSON
    - TransLink GTFS-RT service alerts
  - Upsert snapshots

---

## 10) Frontend Data Fetching Strategy

**TanStack Query** with `useDashboardFeed()` hook:

- Query key: `["dashboardFeed"]`
- Endpoint: `/api/feed`
- `staleTime` suggestion: 2–10 minutes (since it's cached anyway)
- UI uses per-section `meta.fetchedAt` to display "Last updated HH:MM"

**Clock:**

- Client-side component updates every second using `Intl.DateTimeFormat` with `Australia/Brisbane`

**Animations (optional):**

- Framer Motion for:
  - Emergency banner appear/disappear
  - Expand "view more events"
  - Subtle hover transitions

---

## 11) Repo File Structure (Agreed Clean Structure)

- API routes in `app/api/**/route.ts`
- Business logic in `lib/services/*`
- Pure mapping in `lib/normalizers/*`
- Supabase access in `lib/db/*` and `lib/supabase/*`
- UI in `components/dashboard/*`
- Hooks in `hooks/*`
- Types in `types/*`
- Tests in `tests/*`

(Use the previously proposed tree with `app/api/feed`, `app/api/cron/daily`, `app/api/cron/hourly`, etc.)

---

## 12) Testing Approach

### Unit Tests (Vitest)

- Normalisers: ensure raw sample data → normalised models correctly
- Service assembly: snapshot assembly logic

### E2E Tests (Playwright)

Keep small and stable (mock external calls):

- Home loads and displays sections
- "Last updated" labels render correctly
- Events filters change results
- Alert "none" vs "active" states render correctly
- `/api/feed` returns expected shape

### CI

- On PR: lint + typecheck + unit + e2e
- No real external APIs in tests (use fixtures)

---

## 13) Implementation Plan (Step-by-Step)

1. Scaffold Next.js app + Tailwind + shadcn/ui
2. Implement UI skeleton matching Stitch wireframe
3. Create Supabase project + `snapshots` table
4. Implement `/api/feed` reading snapshots (return placeholder if missing)
5. Implement normalisers + services for:
   - Open-Meteo forecast
   - BCC events dataset
6. Implement `POST /api/cron/daily` with secret protection + upserts
7. Add BoM RSS + QLD disaster RSS + QLDTraffic + TransLink GTFS-RT
8. Implement `POST /api/cron/hourly`
9. Add TanStack Query hook + wire UI to feed
10. Add "Last updated" everywhere + clock with seconds
11. Add minimal tests + CI
12. Add Vercel Cron schedules and env vars, deploy

---

## 14) Environment Variables

| Variable | Notes |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Optional if client reads |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only |
| `CRON_SECRET` | Protects cron endpoints |

Optional: keep source URLs in `config/sources.ts` and not as env vars unless they're secret.

---

## Appendix

### Repo Structure

```
brisbane-dashboard/
├─ app/
│  ├─ (site)/
│  │  ├─ layout.tsx                      # One-page dashboard UI
│  │  ├─ page.tsx                        # One-page dashboard UI
│  │  └─ loading.tsx                     # Optional skeleton screen
│  ├─ api/
│  │  ├─ feed/
│  │  │  └─ route.ts                     # GET /api/feed (reads cached snapshots)
│  │  ├─ cron/
│  │  │  ├─ daily/
│  │  │  │  └─ route.ts                  # POST /api/cron/daily (protected)
│  │  │  └─ hourly/
│  │  │     └─ route.ts                  # POST /api/cron/hourly (protected)
│  │  └─ health/
│  │     └─ route.ts                     # GET /api/health (for CI smoke check)
│  ├─ globals.css
│  └─ providers.tsx                      # React Query provider, theme, etc.
│
├─ components/
│  ├─ layout/
│  │  ├─ Header.tsx                      # Brisbane time + global controls
│  │  └─ Section.tsx                     # Section wrapper w/ title + "Last updated"
│  ├─ dashboard/
│  │  ├─ AlertsBanner.tsx                # Emergency alerts (standout vs subtle)
│  │  ├─ WeatherForecast.tsx             # 7-day forecast cards
│  │  ├─ EventsPanel.tsx                 # Events list + chips + search
│  │  ├─ DisruptionsPanel.tsx            # Traffic + public transport
│  │  └─ LastUpdated.tsx                 # Small reusable timestamp display
│  ├─ ui/                                # shadcn/ui components live here
│  └─ motion/
│     └─ MotionPrimitives.tsx            # Framer-motion wrappers (optional)
│
├─ hooks/
│  ├─ useBrisbaneClock.ts                # Ticking clock w/ seconds
│  ├─ useDashboardFeed.ts                # TanStack Query hook for /api/feed
│  └─ useLocalPreferences.ts             # Location/radius/filters persisted
│
├─ lib/
│  ├─ env/
│  │  └─ server.ts                       # Zod-validated server env
│  ├─ supabase/
│  │  ├─ serverClient.ts                 # Service-role client for API/cron
│  │  └─ browserClient.ts               # Optional anon client for client reads
│  ├─ http/
│  │  ├─ fetcher.ts                      # Fetch wrapper (timeout/retry)
│  │  └─ errors.ts                       # Typed errors
│  ├─ normalizers/
│  │  ├─ openMeteo.ts                    # JSON → WeatherForecast7d
│  │  ├─ bomRss.ts                       # RSS → BomWarningsFeed
│  │  ├─ qldDisasterRss.ts              # RSS → EmergencyAlertsFeed
│  │  ├─ bccEvents.ts                    # Dataset → EventsNext7Days
│  │  ├─ qldTraffic.ts                   # GeoJSON → TrafficIncidentsFeed
│  │  └─ translinkGtfsrt.ts             # Protobuf → TransitAlertsFeed
│  ├─ services/
│  │  ├─ weather.service.ts              # Calls Open-Meteo + normalises
│  │  ├─ events.service.ts              # Calls BCC dataset + normalises
│  │  ├─ traffic.service.ts             # Calls QLDTraffic + normalises
│  │  ├─ transit.service.ts             # Calls TransLink + normalises
│  │  ├─ alerts.service.ts              # Calls BoM + QLD Disaster + normalises
│  │  └─ dashboard.service.ts           # Assembles full feed from snapshots
│  ├─ db/
│  │  ├─ snapshots.repo.ts              # Upsert/get snapshot JSON
│  │  └─ types.ts                        # DB row types
│  └─ security/
│     └─ verifyCronSecret.ts            # Checks x-cron-secret header
│
├─ types/
│  ├─ dashboard.ts                       # BrisbaneDashboardFeed + section models
│  ├─ weather.ts
│  ├─ events.ts
│  ├─ traffic.ts
│  ├─ transit.ts
│  └─ alerts.ts
│
├─ config/
│  ├─ sources.ts                         # All source URLs + query params
│  ├─ categories.ts                      # Event tags mapping rules
│  └─ constants.ts                       # Time ranges, refresh cadence
│
├─ public/
│  ├─ icons/                             # Weather icons if you prefer local assets
│  └─ og.png
│
├─ tests/
│  ├─ fixtures/
│  │  ├─ feed.sample.json                # One combined feed for UI/E2E
│  │  ├─ openMeteo.sample.json
│  │  ├─ bomRss.sample.xml
│  │  ├─ qldDisaster.sample.xml
│  │  ├─ qldTraffic.sample.json
│  │  ├─ translink.sample.pb             # Optional (or JSON decoded fixture)
│  │  └─ bccEvents.sample.json
│  ├─ unit/
│  │  ├─ normalizers.test.ts             # Pure mapping tests
│  │  └─ dashboard.service.test.ts
│  └─ e2e/
│     ├─ dashboard.spec.ts               # Playwright: page loads, filters, states
│     └─ api.spec.ts                     # /api/feed returns shape
│
├─ supabase/
│  ├─ migrations/
│  │  └─ 0001_create_snapshots.sql       # snapshots table + indexes
│  └─ seed/
│     └─ snapshots.seed.sql              # Optional local/dev seed
│
├─ .github/
│  └─ workflows/
│     └─ ci.yml                          # lint/typecheck/unit/e2e
│
├─ playwright.config.ts
├─ vitest.config.ts
├─ next.config.ts
├─ tailwind.config.ts
├─ tsconfig.json
├─ package.json
├─ .env.example
└─ README.md
```

### Data Model

#### 0) Shared Primitives

```typescript
// Common severity scale across feeds (you can tune later)
export type Severity = "info" | "minor" | "moderate" | "severe" | "extreme";

// Used for "Last updated HH:MM" per section
export interface SectionMeta {
  source: string;                 // e.g. "open-meteo", "bom-rss"
  fetchedAt: string;              // ISO timestamp
  effectiveFrom?: string;         // optional
  effectiveTo?: string;           // optional
}

export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface GeoBox {
  // optional if you want bounding area coverage
  north: number;
  south: number;
  east: number;
  west: number;
}
```

#### 1) Weather — Open-Meteo (Normalised Output)

**Normalised model (what the UI consumes):**

```typescript
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
  date: string;                 // YYYY-MM-DD (Brisbane local)
  icon: WeatherIcon;
  tempMaxC: number;
  tempMinC: number;
  precipitationChancePct?: number; // 0-100 if available
  precipitationMm?: number;        // optional if you want totals
  windMaxKph?: number;
  windDirDeg?: number;            // 0-360
}

export interface WeatherForecast7d {
  meta: SectionMeta;
  location: {
    name: "Brisbane";
    timezone: "Australia/Brisbane";
    point: GeoPoint;
  };
  days: ForecastDay[]; // length 7
}
```

> **Raw-shape note:** Open-Meteo returns JSON with `daily.time[]` and parallel arrays like `daily.temperature_2m_max[]`, etc. You'll map weather codes to icons.

#### 2) Weather Warnings — BoM RSS (Normalised Output)

**Normalised model:**

```typescript
export interface WeatherWarning {
  id: string;                 // stable hash (e.g., link or guid hash)
  title: string;              // e.g. "Severe Thunderstorm Warning - South East QLD"
  summary?: string;           // short description
  severity: Severity;         // derived from title keywords
  areas?: string[];           // parsed if possible
  issuedAt?: string;          // ISO
  updatedAt?: string;         // ISO
  sourceName: "BOM";
  sourceUrl: string;
}

export interface BomWarningsFeed {
  meta: SectionMeta;
  warnings: WeatherWarning[]; // can be empty
}
```

> **Raw-shape note:** RSS gives you `item.title`, `item.link`, `item.description`, `pubDate`. Use the link/guid as id.

#### 3) Events — Brisbane City Council Events Dataset (Normalised Output)

**Normalised model:**

```typescript
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
  id: string;                 // stable hash from source event id/url + start time
  title: string;
  descriptionShort?: string;  // 1-2 lines
  startAt: string;            // ISO (Brisbane time)
  endAt?: string;             // ISO
  allDay?: boolean;

  venueName?: string;
  suburb?: string;
  address?: string;

  point?: GeoPoint;           // if dataset provides coordinates
  sourceUrl?: string;         // event detail page

  categories: EventCategory[];
  isFree?: boolean;           // best-effort
  imageUrl?: string;          // optional
}

export interface EventsNext7Days {
  meta: SectionMeta;
  range: { from: string; to: string }; // ISO
  events: EventItem[];
}
```

> **Raw-shape note:** The BCC dataset is delivered via the open-data portal (CSV/JSON). Column names can vary; commonly you get title, start/end, location, and a URL. You'll normalise to `EventItem`.

#### 4) Traffic — QLDTraffic GeoJSON (Normalised Output)

**Normalised model:**

```typescript
export type TrafficType =
  | "crash"
  | "roadworks"
  | "hazard"
  | "congestion"
  | "flooding"
  | "closure"
  | "other";

export interface TrafficIncident {
  id: string;               // feature id or hash of key properties
  type: TrafficType;
  severity: Severity;       // map from QLDTraffic fields (or inferred)
  title: string;            // short headline
  description?: string;     // optional details

  locationText?: string;    // e.g. "M3 Riverside Expressway"
  suburb?: string;

  point?: GeoPoint;         // GeoJSON Point
  affectedRoads?: string[];

  startedAt?: string;       // ISO if available
  updatedAt?: string;       // ISO if available
  sourceUrl?: string;
}

export interface TrafficIncidentsFeed {
  meta: SectionMeta;
  incidents: TrafficIncident[];
}
```

> **Raw-shape note:** QLDTraffic provides GeoJSON `FeatureCollection` with `features[]`, each having `geometry` and `properties`. Properties include classification/type, description, and timestamps (depending on feed).

#### 5) Public Transport — TransLink GTFS-RT Service Alerts (Normalised Output)

**Normalised model:**

```typescript
export type TransitMode = "train" | "bus" | "ferry" | "tram" | "other";

export interface TransitAlert {
  id: string;                 // GTFS-RT alert id
  severity: Severity;         // inferred from effect/cause keywords
  headline: string;           // header_text
  description?: string;       // description_text

  modes?: TransitMode[];      // inferred from informed_entity
  routes?: string[];          // route_id or route_short_name if you map it
  stops?: string[];           // stop_id

  activeFrom?: string;        // ISO (start)
  activeTo?: string;          // ISO (end)

  sourceName: "TransLink";
  sourceUrl?: string;         // optional if you provide a link
}

export interface TransitAlertsFeed {
  meta: SectionMeta;
  alerts: TransitAlert[];
}
```

> **Raw-shape note:** GTFS-RT is a protobuf feed (`FeedMessage`). You'll parse `entity[].alert`, then map:
> - `alert.header_text.translation[0].text`
> - `alert.description_text.translation[0].text`
> - `alert.informed_entity[]`
> - `alert.active_period[]`

#### 6) Emergency Alerts — Queensland Disaster Dashboard RSS (Normalised Output)

**Normalised model:**

```typescript
export interface EmergencyAlert {
  id: string;                // guid/link hash
  title: string;
  summary?: string;
  severity: Severity;        // inferred from title/description (e.g., "Emergency Warning")
  category?: string;         // bushfire / flood / storm / etc (best-effort)
  areas?: string[];          // best-effort parse
  issuedAt?: string;         // ISO (pubDate)
  updatedAt?: string;        // ISO if available
  sourceName: "Queensland Disaster";
  sourceUrl: string;
}

export interface EmergencyAlertsFeed {
  meta: SectionMeta;
  alerts: EmergencyAlert[];  // can be empty
}
```

> **Raw-shape note:** RSS `item.title`/`link`/`description`/`pubDate`. Similar parsing approach to BoM RSS.

#### 7) Combined "One-Page Payload" (what `/api/feed` returns)

This is the object the frontend fetches once and renders all sections + "last updated" times.

```typescript
export interface BrisbaneDashboardFeed {
  generatedAt: string; // ISO, when this payload was assembled

  header: {
    city: "Brisbane";
    timezone: "Australia/Brisbane";
  };

  emergency: EmergencyAlertsFeed;     // QLD Disaster RSS
  bomWarnings: BomWarningsFeed;       // BoM RSS
  weather: WeatherForecast7d;         // Open-Meteo
  events: EventsNext7Days;            // BCC events dataset
  traffic: TrafficIncidentsFeed;      // QLDTraffic GeoJSON
  transit: TransitAlertsFeed;         // TransLink GTFS-RT
}
```
