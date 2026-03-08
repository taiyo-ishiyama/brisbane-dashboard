"use client";

import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  Wind,
  CloudHail,
  HelpCircle,
  Droplets,
} from "lucide-react";
import type { WeatherForecast7d, WeatherIcon, ForecastDay } from "@/types/weather";
import { Caption, Tiny, Display, DisplaySecondary } from "@/components/ui/Typography";
import Section from "@/components/layout/Section";

const weatherIcons: Record<WeatherIcon, React.ComponentType<{ className?: string }>> = {
  clear: Sun,
  partly_cloudy: CloudSun,
  cloudy: Cloud,
  fog: CloudFog,
  rain: CloudRain,
  showers: CloudDrizzle,
  storm: CloudLightning,
  hail: CloudHail,
  wind: Wind,
  unknown: HelpCircle,
};

const weatherIconColours: Record<WeatherIcon, string> = {
  clear: "text-amber-400",
  partly_cloudy: "text-amber-300",
  cloudy: "text-slate-400",
  fog: "text-slate-400",
  rain: "text-blue-400",
  showers: "text-blue-300",
  storm: "text-indigo-500",
  hail: "text-cyan-500",
  wind: "text-teal-400",
  unknown: "text-slate-300",
};

function isToday(dateStr: string) {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Australia/Brisbane",
  });
  return dateStr === today;
}

function formatDay(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00+10:00");
  return {
    dayName: d.toLocaleDateString("en-AU", {
      weekday: "short",
      timeZone: "Australia/Brisbane",
    }),
    date: d.toLocaleDateString("en-AU", {
      day: "2-digit",
      timeZone: "Australia/Brisbane",
    }),
  };
}

function DayCard({ day }: { day: ForecastDay }) {
  const Icon = weatherIcons[day.icon];
  const iconColour = weatherIconColours[day.icon];
  const today = isToday(day.date);
  const { dayName, date } = formatDay(day.date);

  return (
    <div
      className={`flex min-w-[100px] flex-col items-center rounded-xl border px-4 py-4 transition-shadow ${
        today
          ? "border-primary-300 bg-primary-50 shadow-md ring-2 ring-primary-200"
          : "border-slate-200 bg-white hover:shadow-sm"
      }`}
    >
      <Caption className={`!font-semibold ${today ? "!text-primary-600" : "!text-slate-500"}`}>
        {today ? "Today" : dayName}
      </Caption>
      <Tiny>{date}</Tiny>

      <Icon className={`my-3 h-8 w-8 ${iconColour}`} />

      <div className="flex items-baseline gap-1">
        <Display>{Math.round(day.tempMaxC)}&deg;</Display>
        <DisplaySecondary>{Math.round(day.tempMinC)}&deg;</DisplaySecondary>
      </div>

      {day.precipitationChancePct != null && day.precipitationChancePct > 0 && (
        <Caption className="mt-1 inline-flex items-center gap-0.5 !text-blue-500">
          <Droplets className="h-3 w-3" />
          {day.precipitationChancePct}%
        </Caption>
      )}

      {day.windMaxKph != null && (
        <Tiny className="mt-0.5 inline-flex items-center gap-0.5">
          <Wind className="h-3 w-3" />
          {Math.round(day.windMaxKph)} km/h
        </Tiny>
      )}
    </div>
  );
}

interface WeatherForecastProps {
  data: WeatherForecast7d;
}

export default function WeatherForecast({ data }: WeatherForecastProps) {
  return (
    <Section
      title="7-Day Forecast"
      icon={<CloudSun className="h-5 w-5 text-amber-400" />}
      fetchedAt={data.meta.fetchedAt}
    >
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {data.days.map((day) => (
          <DayCard key={day.date} day={day} />
        ))}
      </div>
    </Section>
  );
}
