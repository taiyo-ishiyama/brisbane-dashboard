import { test, expect } from "@playwright/test";

test.describe("API", () => {
  test("GET /api/health returns 200", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBe(true);
    expect(await response.text()).toBe("OK");
  });

  test("POST /api/cron/daily rejects without secret", async ({ request }) => {
    const response = await request.post("/api/cron/daily");
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorised");
  });

  test("POST /api/cron/hourly rejects without secret", async ({ request }) => {
    const response = await request.post("/api/cron/hourly");
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorised");
  });
});
