import { z } from "zod";
import { fetchJson } from "@/lib/http/fetcher";
import { OPEN_METEO_URL } from "@/config/sources";
import { normaliseOpenMeteo } from "@/lib/normalizers/openMeteo";
import type { WeatherForecast7d } from "@/types/weather";

const OpenMeteoSchema = z.object({
  daily: z.object({
    time: z.array(z.string()),
    weather_code: z.array(z.number()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    precipitation_sum: z.array(z.number()),
    precipitation_probability_max: z.array(z.number()),
    wind_speed_10m_max: z.array(z.number()),
    wind_direction_10m_dominant: z.array(z.number()),
  }),
});

export async function fetchWeather(): Promise<WeatherForecast7d> {
  const raw = await fetchJson<unknown>(OPEN_METEO_URL);
  const parsed = OpenMeteoSchema.parse(raw);
  return normaliseOpenMeteo(parsed);
}
