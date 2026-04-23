import { verifyCronSecret } from "@/lib/security/verifyCronSecret";
import { fetchWeather } from "@/lib/services/weather.service";
import { fetchEvents } from "@/lib/services/events.service";
import { upsertSnapshot } from "@/lib/db/snapshots.repo";
import { Section } from "@/config/constants";

export { handler as GET, handler as POST };

async function handler(request: Request) {
  const unauthorized = verifyCronSecret(request);
  if (unauthorized) return unauthorized;

  const completed: string[] = [];
  const errors: string[] = [];

  // Fetch weather and events in parallel
  const results = await Promise.allSettled([
    fetchWeather().then(async (weather) => {
      await upsertSnapshot(Section.Weather, weather);
      completed.push(Section.Weather);
    }),
    fetchEvents().then(async (events) => {
      await upsertSnapshot(Section.Events, events);
      completed.push(Section.Events);
    }),
  ]);

  for (const r of results) {
    if (r.status === "rejected") {
      console.error("[cron/daily]", r.reason);
      errors.push("Internal refresh error");
    }
  }

  const ok = errors.length === 0;
  const allFailed = completed.length === 0 && errors.length > 0;
  return Response.json(
    { ok, sections: completed, errors: ok ? undefined : errors, fetchedAt: new Date().toISOString() },
    { status: ok ? 200 : allFailed ? 500 : 207 },
  );
}
