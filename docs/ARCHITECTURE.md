# Architecture

## Overview

Brisbane Local Dashboard is a one-page web app with a serverless data pipeline. Cron jobs fetch data from six official sources, normalise it into a stable schema, and cache it in Supabase. The frontend reads a single `/api/feed` endpoint and renders all sections.

## Data Flow

```text
External APIs → Cron Jobs → Normalizers → Supabase → /api/feed → React Query → UI
```

1. **Cron jobs** trigger on schedule (daily or hourly)
2. **Services** fetch raw data from external APIs
3. **Normalisers** transform raw formats (JSON, RSS, GeoJSON, Protobuf) into stable TypeScript models
4. **Supabase** stores normalised payloads as JSON snapshots
5. **`/api/feed`** reads all latest snapshots and assembles a single response
6. **React Query** fetches the feed client-side with 5-minute refetch intervals
7. **UI components** render each section from the typed feed data

## Rendering Strategy

| Route | Method | Strategy |
|-------|--------|----------|
| `/` | GET | Client-side rendering (React Query) |
| `/api/feed` | GET | Dynamic — reads Supabase snapshots |
| `/api/health` | GET | Static 200 response |
| `/api/cron/daily` | GET/POST | Protected — weather + events |
| `/api/cron/hourly` | GET/POST | Protected — alerts + disruptions |

The dashboard page is a single client component. All data fetching happens through `/api/feed`, keeping the frontend decoupled from data sources.

## Cron Pipeline

### Daily Job (`/api/cron/daily`)

Scheduled via Vercel Cron at 06:00 UTC (16:00 AEST).

| Source | Normaliser | Output |
|--------|------------|--------|
| Open-Meteo API | `openMeteo.ts` | `WeatherForecast7d` |
| BCC Events API | `bccEvents.ts` | `EventsNext7Days` |

### Hourly Job (`/api/cron/hourly`)

Scheduled via GitHub Actions cron every hour.

| Source | Normaliser | Output |
|--------|------------|--------|
| BoM RSS | `bomRss.ts` | `BomWarningsFeed` |
| QLD Disaster RSS | `qldDisasterRss.ts` | `EmergencyAlertsFeed` |
| QLDTraffic GeoJSON | `qldTraffic.ts` | `TrafficIncidentsFeed` |
| TransLink GTFS-RT | `translinkGtfsrt.ts` | `TransitAlertsFeed` |

All fetches run in parallel via `Promise.allSettled`. Partial failures don't block other sources.

### Security

Cron endpoints require an `x-cron-secret` header matching the `CRON_SECRET` env var. Vercel Cron sends this automatically; the GitHub Actions workflow reads it from repository secrets.

## Normaliser Architecture

Each normaliser is a pure function: raw input in, typed model out. No side effects, no API calls.

```text
lib/normalizers/
├── openMeteo.ts         # JSON → WeatherForecast7d
├── bccEvents.ts         # JSON → EventsNext7Days
├── bomRss.ts            # XML/RSS → BomWarningsFeed
├── qldDisasterRss.ts    # XML/Atom → EmergencyAlertsFeed
├── qldTraffic.ts        # GeoJSON → TrafficIncidentsFeed
└── translinkGtfsrt.ts   # Protobuf → TransitAlertsFeed
```

Key design decisions:
- WMO weather codes mapped to icon enums (`clear`, `rain`, `storm`, etc.)
- QLDTraffic incidents filtered to Brisbane metro LGAs only
- TransLink route modes inferred from `routeId` patterns when `routeType` is absent
- Event categories mapped from BCC tags via a config lookup table
- Severity levels normalised to a shared 5-level scale across all feeds

## Component Architecture

### Layout Components
- `Header` — Sticky header with logo, title, and live Brisbane clock
- `Section` — Reusable wrapper with title, icon, and "Last updated" timestamp

### Dashboard Components
- `AlertsBanner` — Emergency alerts with severity-based styling, or "all clear" state
- `WeatherForecast` — 7-day horizontal card strip with icons, temps, precipitation
- `EventsPanel` — Event cards with category tags, search, filters, and "View all" modal
- `DisruptionsPanel` — Two-column layout: traffic incidents + transit alerts by mode

### UI Components
- `Typography` — Type-safe text components (PageTitle, Body, Caption, Display, etc.)
- `Modal` — Portal-rendered dialog with focus trapping and scroll lock

## Styling

- **Tailwind CSS 4** with custom theme tokens in `globals.css`
- **Colour palette**: Teal primary (`#14b8a6`), warm stone neutrals
- **Typography**: DM Sans (body/display), JetBrains Mono (clock/data)
- **No gradients, no glow effects** — clean civic design

## Environment Configuration

Server environment variables are validated at runtime using Zod via a lazy proxy (`lib/env/server.ts`). Validation only runs on first access, avoiding build-time failures when env vars aren't available.

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `WeatherForecast.tsx` |
| Pages | `page.tsx` | `app/(site)/page.tsx` |
| API Routes | `route.ts` | `app/api/feed/route.ts` |
| Normalisers | camelCase | `openMeteo.ts` |
| Services | kebab-case | `weather.service.ts` |
| Types | camelCase | `weather.ts` |
| Config | camelCase | `sources.ts` |
