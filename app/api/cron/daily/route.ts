import { verifyCronSecret } from "@/lib/security/verifyCronSecret";
import { fetchWeather } from "@/lib/services/weather.service";
import { upsertSnapshot } from "@/lib/db/snapshots.repo";
import { Section } from "@/config/constants";

export async function POST(request: Request) {
  const unauthorized = verifyCronSecret(request);
  if (unauthorized) return unauthorized;

  try {
    const weather = await fetchWeather();
    await upsertSnapshot(Section.Weather, weather);

    return Response.json({
      ok: true,
      sections: [Section.Weather],
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[cron/daily]", err);
    return Response.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
