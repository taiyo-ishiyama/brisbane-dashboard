import { verifyCronSecret } from "@/lib/security/verifyCronSecret";
import { fetchBomWarnings, fetchQldDisasterAlerts } from "@/lib/services/alerts.service";
import { fetchTransitAlerts } from "@/lib/services/transit.service";
import { fetchTraffic } from "@/lib/services/traffic.service";
import { upsertSnapshot } from "@/lib/db/snapshots.repo";
import { Section } from "@/config/constants";

export { handler as GET, handler as POST };

async function handler(request: Request) {
  const unauthorized = verifyCronSecret(request);
  if (unauthorized) return unauthorized;

  const completed: string[] = [];
  const errors: string[] = [];

  const results = await Promise.allSettled([
    fetchBomWarnings().then(async (warnings) => {
      await upsertSnapshot(Section.BomWarnings, warnings);
      completed.push(Section.BomWarnings);
    }),
    fetchQldDisasterAlerts().then(async (alerts) => {
      await upsertSnapshot(Section.Emergency, alerts);
      completed.push(Section.Emergency);
    }),
    fetchTransitAlerts().then(async (transit) => {
      await upsertSnapshot(Section.Transit, transit);
      completed.push(Section.Transit);
    }),
    fetchTraffic().then(async (traffic) => {
      await upsertSnapshot(Section.Traffic, traffic);
      completed.push(Section.Traffic);
    }),
  ]);

  for (const r of results) {
    if (r.status === "rejected") {
      console.error("[cron/hourly]", r.reason);
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
