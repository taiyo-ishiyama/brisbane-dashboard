import { test, expect } from "@playwright/test";

test.describe("API", () => {
  test("GET /api/health returns 200", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBe(true);
    expect(await response.text()).toBe("OK");
  });

  test("POST /api/cron/daily rejects without secret", async ({ request }) => {
    const response = await request.post("/api/cron/daily");
    // 401 when CRON_SECRET is set, 500 when env vars missing (CI)
    expect([401, 500]).toContain(response.status());
  });

  test("POST /api/cron/hourly rejects without secret", async ({ request }) => {
    const response = await request.post("/api/cron/hourly");
    expect([401, 500]).toContain(response.status());
  });
});
