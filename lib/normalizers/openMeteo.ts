import type { WeatherIcon, ForecastDay, WeatherForecast7d } from "@/types/weather";
import type { SectionMeta } from "@/types/dashboard";

interface OpenMeteoDailyResponse {
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    wind_direction_10m_dominant: number[];
  };
}

function wmoToIcon(code: number): WeatherIcon {
  if (code === 0) return "clear";
  if (code <= 2) return "partly_cloudy";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 55) return "showers";
  if ((code >= 56 && code <= 57) || (code >= 61 && code <= 65) || (code >= 80 && code <= 82))
    return "rain";
  if (code >= 66 && code <= 67) return "hail";
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "rain";
  if (code === 95 || code === 96 || code === 99) return "storm";
  return "unknown";
}

export function normaliseOpenMeteo(
  raw: OpenMeteoDailyResponse,
): WeatherForecast7d {
  const { daily } = raw;

  const days: ForecastDay[] = daily.time.map((date, i) => ({
    date,
    icon: wmoToIcon(daily.weather_code[i]),
    tempMaxC: daily.temperature_2m_max[i],
    tempMinC: daily.temperature_2m_min[i],
    precipitationChancePct: daily.precipitation_probability_max[i],
    precipitationMm: daily.precipitation_sum[i],
    windMaxKph: daily.wind_speed_10m_max[i],
    windDirDeg: daily.wind_direction_10m_dominant[i],
  }));

  const meta: SectionMeta = {
    source: "Open-Meteo",
    fetchedAt: new Date().toISOString(),
  };

  return {
    meta,
    location: {
      name: "Brisbane",
      timezone: "Australia/Brisbane",
      point: { lat: -27.47, lon: 153.03 },
    },
    days,
  };
}
