# Testing

This document describes the testing strategy and how to run tests.

## Overview

| Type | Framework | Directory |
|------|-----------|-----------|
| E2E | Playwright | `tests/e2e/` |
| Unit | Vitest | `tests/unit/` |

## Running Tests

```bash
# Run unit tests
pnpm test

# Run E2E tests (starts dev server automatically)
pnpm test:e2e

# Install Playwright browsers (first time only)
pnpm exec playwright install chromium
```

## E2E Tests (Playwright)

### Test Files

| File | Description |
|------|-------------|
| `dashboard.spec.ts` | Dashboard UI — page load, sections, modals, filters, error states |
| `api.spec.ts` | API endpoints — health check, cron secret protection |

### Test Coverage

#### Dashboard Tests (8 tests)
- Page loads and displays all sections (header, clock, weather, events, disruptions)
- Weather forecast cards show temperatures
- Traffic incidents render
- Transit alerts open in modal by mode
- "View all events" modal with category filtering
- Event search filters results
- "No active alerts" state renders correctly
- Error state with retry button on feed failure

#### API Tests (3 tests)
- `GET /api/health` returns 200
- `POST /api/cron/daily` rejects without secret
- `POST /api/cron/hourly` rejects without secret

### Mocking Strategy

Dashboard tests mock the `/api/feed` endpoint using Playwright's `page.route()` to intercept requests and return fixture data from `tests/fixtures/feed.sample.json`. This ensures:

- Tests don't depend on Supabase or external APIs
- Tests are fast and deterministic
- UI behaviour is tested in isolation

```typescript
test.beforeEach(async ({ page }) => {
  await page.route("**/api/feed", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(feedFixture),
    }),
  );
});
```

API tests hit the real endpoints but don't require env vars for the cron rejection tests (both 401 and 500 are accepted since env vars may be absent in CI).

### Configuration

Playwright config in `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://localhost:3000",
    locale: "en-AU",
    timezoneId: "Australia/Brisbane",
  },
  webServer: {
    command: process.env.CI ? "pnpm start" : "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
```

In CI, the app is built first and served with `pnpm start` for consistency.

## Unit Tests (Vitest)

Unit tests are located in `tests/unit/` and cover normalisers and service assembly logic.

### Test Files

| File | Description |
|------|-------------|
| `normalizers.test.ts` | Pure mapping tests for all normalisers |
| `dashboard.service.test.ts` | Snapshot assembly logic |

### Writing Unit Tests

```typescript
import { describe, it, expect } from "vitest";
import { normaliseOpenMeteo } from "@/lib/normalizers/openMeteo";
import fixture from "../fixtures/openMeteo.sample.json";

describe("normaliseOpenMeteo", () => {
  it("returns 7 forecast days", () => {
    const result = normaliseOpenMeteo(fixture);
    expect(result.days).toHaveLength(7);
  });
});
```

### Fixtures

Test fixtures are in `tests/fixtures/`:

| File | Description |
|------|-------------|
| `feed.sample.json` | Complete dashboard feed (used by E2E tests) |
| `openMeteo.sample.json` | Raw Open-Meteo API response |
| `bccEvents.sample.json` | Raw BCC events dataset response |
| `bomRss.sample.xml` | Raw BoM RSS feed |
| `qldDisaster.sample.xml` | Raw QLD Disaster Atom feed |
| `qldTraffic.sample.json` | Raw QLDTraffic GeoJSON |
| `translink.sample.json` | Decoded TransLink GTFS-RT data |

## CI/CD Integration

### CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and pull request with four parallel jobs:

| Job | Command |
|-----|---------|
| lint | `pnpm lint` |
| typecheck | `pnpm typecheck` |
| test | `pnpm test` |
| build | `pnpm build` |

### E2E Workflow (`.github/workflows/e2e.yml`)

Runs on push to `main` only:

1. Install dependencies
2. Install Playwright Chromium
3. Build the app
4. Run `pnpm test:e2e`
5. Upload Playwright report as artifact on failure (7-day retention)

## Best Practices

1. **Mock external data** — E2E tests use fixture data, never hit real APIs
2. **Use roles and labels** — prefer `getByRole()` and `getByText()` over test IDs
3. **Test user flows** — focus on what a user sees and does
4. **Keep tests independent** — each test works in isolation
5. **Brisbane timezone** — Playwright is configured with `Australia/Brisbane` timezone
