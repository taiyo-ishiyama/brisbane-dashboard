"use client";

import Header from "@/components/layout/Header";
import AlertsBanner from "@/components/dashboard/AlertsBanner";
import WeatherForecast from "@/components/dashboard/WeatherForecast";
import EventsPanel from "@/components/dashboard/EventsPanel";
import DisruptionsPanel from "@/components/dashboard/DisruptionsPanel";
import { Muted } from "@/components/ui/Typography";
import { useDashboardFeed } from "@/hooks/useDashboardFeed";

export default function HomePage() {
  const { data: feed, isLoading, isError, refetch } = useDashboardFeed();

  return (
    <div className="min-h-screen bg-surface">
      <Header />

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6">
        {isLoading && <LoadingSkeleton />}

        {isError && !feed && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-800">
              Failed to load dashboard data. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {isError && feed && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-800">
            Showing the last successful update. Refresh failed —{" "}
            <button
              onClick={() => refetch()}
              className="underline hover:text-amber-900"
            >
              retry
            </button>
          </div>
        )}

        {feed && (
          <>
            <AlertsBanner data={feed.emergency} />
            <WeatherForecast data={feed.weather} />
            <EventsPanel data={feed.events} />
            <DisruptionsPanel
              traffic={feed.traffic}
              transit={feed.transit}
              fetchedAt={feed.traffic.meta.fetchedAt}
            />
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center sm:px-6">
          <Muted>
            &copy; {new Date().getFullYear()} Brisbane Local Dashboard. Data
            sources: BOM, TransLink, Brisbane City Council.
          </Muted>
        </div>
      </footer>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Alert skeleton */}
      <div className="h-16 rounded-lg bg-slate-200" />
      {/* Weather skeleton */}
      <div className="h-48 rounded-lg bg-slate-200" />
      {/* Events skeleton */}
      <div className="h-64 rounded-lg bg-slate-200" />
      {/* Disruptions skeleton */}
      <div className="h-48 rounded-lg bg-slate-200" />
    </div>
  );
}
