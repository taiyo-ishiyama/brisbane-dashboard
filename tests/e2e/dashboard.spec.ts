import { test, expect, type Page } from "@playwright/test";
import feedFixture from "../fixtures/feed.sample.json";

/** Navigate to the page and wait for the splash screen to dismiss. */
async function gotoDashboard(page: Page, path = "/") {
  await page.goto(path);
  // Splash screen has duration=2500ms + 400ms fade-out
  await expect(page.getByRole("dialog", { name: /splash/i })).toBeHidden({ timeout: 10_000 }).catch(() => {});
  // Wait for the dashboard content to become visible (splash hides it via visibility:hidden)
  await page.waitForFunction(
    () => {
      const main = document.querySelector("main");
      if (!main) return false;
      const wrapper = main.closest("div[style]");
      return wrapper ? getComputedStyle(wrapper).visibility !== "hidden" : true;
    },
    null,
    { timeout: 10_000 },
  );
}

test.beforeEach(async ({ page }) => {
  // Mock /api/feed to return fixture data
  await page.route("**/api/feed", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(feedFixture),
    }),
  );
});

test.describe("Dashboard page", () => {
  test("loads and displays all sections", async ({ page }) => {
    await gotoDashboard(page);

    // Header
    await expect(page.getByRole("heading", { name: /brisbane local dashboard/i })).toBeVisible();

    // Clock is ticking
    await expect(page.locator("header").getByText(/\d{2}:\d{2}:\d{2}/)).toBeVisible();

    // Emergency alerts — no active alerts state
    await expect(page.getByText(/no active emergency alerts/i)).toBeVisible();

    // Weather — 7 day cards
    await expect(page.getByText("7-Day Forecast")).toBeVisible();
    await expect(page.getByText("Today")).toBeVisible();

    // Events section
    await expect(page.getByText(/events — next 7 days/i)).toBeVisible();
    await expect(page.getByText("South Bank Markets")).toBeVisible();
    await expect(page.getByText("Brisbane Jazz Festival")).toBeVisible();

    // Disruptions section
    await expect(page.getByText("Disruptions")).toBeVisible();
    await expect(page.getByText("Traffic Incidents")).toBeVisible();
    await expect(page.getByText("Public Transport")).toBeVisible();
  });

  test("shows weather forecast cards with temperatures", async ({ page }) => {
    await gotoDashboard(page);

    // Check temperature values render
    await expect(page.getByText("28°")).toBeVisible();
    await expect(page.getByText("18°").first()).toBeVisible();
  });

  test("shows traffic incidents", async ({ page }) => {
    await gotoDashboard(page);

    await expect(page.getByText("Roadworks on Coronation Drive")).toBeVisible();
    await expect(page.getByText("Multi-vehicle crash on M3")).toBeVisible();
  });

  test("shows transit alerts by mode", async ({ page }) => {
    await gotoDashboard(page);

    // Train and bus mode buttons should be visible
    await expect(page.getByText("Train")).toBeVisible();
    await expect(page.getByText("Bus")).toBeVisible();

    // Click train button to open modal
    await page.getByRole("button", { name: /train/i }).click();
    await expect(page.getByText("Beenleigh line: reduced service")).toBeVisible();
  });

  test("events 'View all' opens modal with filters", async ({ page }) => {
    await gotoDashboard(page);

    // Click "View all events"
    await page.getByRole("button", { name: /view all events/i }).click();

    // Modal should open with filter toolbar
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByPlaceholder("Search events...")).toBeVisible();

    // All 4 events should be visible in the modal
    await expect(page.getByRole("dialog").getByText("South Bank Markets")).toBeVisible();
    await expect(page.getByRole("dialog").getByText("Tech Meetup Brisbane")).toBeVisible();

    // Filter by category
    await page.getByRole("dialog").getByRole("button", { name: "Music" }).click();
    await expect(page.getByRole("dialog").getByText("Brisbane Jazz Festival")).toBeVisible();
    await expect(page.getByRole("dialog").getByText("South Bank Markets")).not.toBeVisible();

    // Close modal
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("events search filters results", async ({ page }) => {
    await gotoDashboard(page);

    await page.getByRole("button", { name: /view all events/i }).click();
    await page.getByPlaceholder("Search events...").fill("jazz");

    await expect(page.getByRole("dialog").getByText("Brisbane Jazz Festival")).toBeVisible();
    await expect(page.getByRole("dialog").getByText("South Bank Markets")).not.toBeVisible();
  });

  test("'No active alerts' renders when alerts are empty", async ({ page }) => {
    await gotoDashboard(page);

    await expect(page.getByText(/no active emergency alerts/i)).toBeVisible();
  });

  test("shows error state and retry on feed failure", async ({ page }) => {
    // Override the mock to return an error
    await page.route("**/api/feed", (route) =>
      route.fulfill({ status: 500, body: '{"error":"fail"}' }),
    );

    await gotoDashboard(page);

    await expect(page.getByText(/failed to load dashboard data/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /retry/i })).toBeVisible();
  });
});
