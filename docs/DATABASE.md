# Database Model

## Overview

The dashboard uses Supabase (cloud Postgres) with a single `snapshots` table. Each data source writes its latest normalised payload as a JSON blob, and the `/api/feed` endpoint reads all latest snapshots to assemble the dashboard response.

## Schema

### Table: `snapshots`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | `UUID` | `gen_random_uuid()` | Primary key |
| `section` | `TEXT` | — | Data source identifier |
| `key` | `TEXT` | `'latest'` | Snapshot version key |
| `fetched_at` | `TIMESTAMPTZ` | — | When the data was fetched |
| `payload` | `JSONB` | — | Normalised JSON payload |

**Unique constraint:** `(section, key)` — enables upsert on refresh.

### Section Values

| Section | Written By | Contains |
|---------|------------|----------|
| `weather` | Daily cron | 7-day forecast from Open-Meteo |
| `events` | Daily cron | Next 7 days of BCC events |
| `bomWarnings` | Hourly cron | BoM weather warnings |
| `emergency` | Hourly cron | QLD disaster alerts |
| `traffic` | Hourly cron | QLDTraffic incidents |
| `transit` | Hourly cron | TransLink service alerts |

## Migration

Located at `supabase/migrations/0001_create_snapshots.sql`:

```sql
CREATE TABLE IF NOT EXISTS snapshots (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section     TEXT NOT NULL,
  key         TEXT NOT NULL DEFAULT 'latest',
  fetched_at  TIMESTAMPTZ NOT NULL,
  payload     JSONB NOT NULL,
  UNIQUE (section, key)
);
```

## Row Level Security (RLS)

RLS is enabled with the following policies:

| Policy | Action | Role | Description |
|--------|--------|------|-------------|
| Public read | SELECT | All | Anyone can read snapshots |
| Service insert | INSERT | Service role | Only server can insert |
| Service update | UPDATE | Service role | Only server can update |
| Service all | ALL | Service role | Full access for server |

## Access Patterns

### Write: Upsert Snapshot

Called by cron jobs after fetching and normalising data.

```typescript
await upsertSnapshot("weather", normalisedPayload);
```

Uses Supabase's `upsert` with `onConflict: "section,key"` — always overwrites the `latest` row for each section.

### Read: Get All Latest

Called by `/api/feed` to assemble the dashboard response.

```typescript
const snapshots = await getAllLatestSnapshots();
// Returns: Record<string, unknown>
// { weather: {...}, events: {...}, traffic: {...}, ... }
```

Single query: `SELECT section, payload FROM snapshots WHERE key = 'latest'`.

### Read: Get Single Snapshot

Available but not currently used by the feed endpoint.

```typescript
const weather = await getLatestSnapshot<WeatherForecast7d>("weather");
```

## Payload Structure

Each section's `payload` column stores the full normalised model as defined in `types/`. Every payload includes a `meta` object:

```json
{
  "meta": {
    "source": "open-meteo",
    "fetchedAt": "2026-04-24T06:00:00.000Z"
  },
  "days": [...]
}
```

The `meta.fetchedAt` timestamp is used by the frontend to display "Last updated HH:MM" per section.

## Combined Feed Response

The `/api/feed` endpoint assembles all snapshots into a single `BrisbaneDashboardFeed` object:

```typescript
{
  generatedAt: string;
  header: { city: "Brisbane", timezone: "Australia/Brisbane" };
  emergency: EmergencyAlertsFeed;
  bomWarnings: BomWarningsFeed;
  weather: WeatherForecast7d;
  events: EventsNext7Days;
  traffic: TrafficIncidentsFeed;
  transit: TransitAlertsFeed;
}
```

Missing sections fall back to empty arrays with blank metadata, so the frontend always receives a complete response shape.

## Design Decisions

1. **Single table with JSONB** — avoids schema migrations when feed formats change. The normaliser layer guarantees structure.
2. **`key = 'latest'` upsert** — simple, no history. Each refresh overwrites the previous snapshot.
3. **No client-side Supabase access** — all reads go through `/api/feed` on the server, keeping the service role key server-only.
4. **RLS with public read** — the feed endpoint could alternatively use the anon key, but currently uses the service role for consistency.
