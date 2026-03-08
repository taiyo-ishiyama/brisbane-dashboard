import { fetchJson } from "@/lib/http/fetcher";
import { OPEN_METEO_URL } from "@/config/sources";
import { normaliseOpenMeteo } from "@/lib/normalizers/openMeteo";
import type { WeatherForecast7d } from "@/types/weather";

export async function fetchWeather(): Promise<WeatherForecast7d> {
  const raw = await fetchJson<{ daily: Record<string, unknown[]> }>(
    OPEN_METEO_URL,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return normaliseOpenMeteo(raw as any);
}
