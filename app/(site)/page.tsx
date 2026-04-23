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
    <div className="min-h-dvh bg-surface">
      <Header />

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6">
        {isLoading && <LoadingSkeleton />}

        {isError && !feed && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-800 text-pretty">
              Failed to load dashboard data. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {isError && feed && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center text-sm text-amber-800">
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

      <footer className="mt-8 border-t border-stone-200/60 bg-white/60">
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
    <div className="space-y-8">
      {/* Alert skeleton */}
      <div className="skeleton h-12 rounded-xl" />

      {/* Weather skeleton — 7 card outlines */}
      <div>
        <div className="skeleton mb-4 h-5 w-36 rounded" />
        <div className="flex gap-3">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="flex min-w-[104px] flex-col items-center gap-2 rounded-xl border border-stone-200/40 bg-white p-4">
              <div className="skeleton h-3 w-10 rounded" />
              <div className="skeleton size-8 rounded-full" />
              <div className="skeleton h-5 w-14 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Events skeleton — 3 card outlines */}
      <div>
        <div className="skeleton mb-4 h-5 w-44 rounded" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-stone-200/40 bg-white">
              <div className="skeleton h-36" />
              <div className="space-y-2 p-3">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disruptions skeleton */}
      <div>
        <div className="skeleton mb-4 h-5 w-28 rounded" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="skeleton h-16 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
