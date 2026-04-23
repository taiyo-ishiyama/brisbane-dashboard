# Brisbane Local Dashboard

A one-page dashboard for Brisbane residents showing weather forecasts, local events, traffic incidents, public transport alerts, and emergency warnings — all sourced from official open data feeds.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |
| Data Fetching | TanStack Query |
| Database | Supabase (Postgres) |
| Fonts | DM Sans + JetBrains Mono |
| Hosting | Vercel |
| Testing | Playwright (E2E), Vitest (Unit) |
| CI/CD | GitHub Actions |

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run linting and type checking
pnpm lint
pnpm typecheck

# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e
```

## Project Structure

```
brisbane-dashboard/
├── app/                  # Next.js App Router
│   ├── (site)/           # Dashboard page
│   ├── api/
│   │   ├── feed/         # GET /api/feed — public dashboard data
│   │   ├── cron/daily/   # Weather + events refresh
│   │   ├── cron/hourly/  # Alerts + disruptions refresh
│   │   └── health/       # Health check endpoint
│   └── providers.tsx     # React Query provider
├── components/
│   ├── dashboard/        # AlertsBanner, WeatherForecast, EventsPanel, DisruptionsPanel
│   ├── layout/           # Header, Section
│   └── ui/               # Typography, Modal
├── hooks/                # useDashboardFeed, useBrisbaneClock
├── lib/
│   ├── normalizers/      # Raw API → normalised models
│   ├── services/         # Fetch + normalise per data source
│   ├── db/               # Supabase snapshot repo
│   ├── supabase/         # Supabase client
│   ├── http/             # Fetch wrapper with retry/timeout
│   ├── env/              # Zod-validated env vars
│   └── security/         # Cron secret verification
├── types/                # TypeScript type definitions
├── config/               # Source URLs, categories, constants
├── tests/
│   ├── e2e/              # Playwright tests
│   ├── unit/             # Vitest tests
│   └── fixtures/         # Sample data for tests
├── supabase/             # Migrations and seeds
└── .github/workflows/    # CI, E2E, hourly cron
```

## Environment Variables

Create a `.env.local` file:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CRON_SECRET=your_cron_secret
QLD_TRAFFIC_API_KEY=your_qld_traffic_api_key
```

## Data Sources

| Section | Source | Refresh |
|---------|--------|---------|
| Weather forecast | Open-Meteo | Daily |
| Events | Brisbane City Council open data | Daily |
| Weather warnings | Bureau of Meteorology RSS | Hourly |
| Emergency alerts | Queensland Disaster Dashboard RSS | Hourly |
| Traffic incidents | QLDTraffic GeoJSON | Hourly |
| Transit alerts | TransLink GTFS-RT | Hourly |

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) — System design and data flow
- [Database Model](./docs/DATABASE.md) — Supabase schema and snapshot strategy
- [Testing](./docs/TESTING.md) — Testing strategy and commands
- [Planning](./docs/PLANNING.md) — Original planning document
