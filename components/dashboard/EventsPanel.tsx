"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import type { EventsNext7Days, EventCategory, EventItem } from "@/types/events";
import { CardTitle, Body, Caption, Label } from "@/components/ui/Typography";
import Section from "@/components/layout/Section";

const CATEGORY_LABELS: Record<EventCategory, string> = {
  markets: "Markets",
  family: "Family",
  music: "Music",
  arts: "Arts",
  community: "Community",
  sport: "Sport",
  food: "Food",
  tech: "Tech",
  other: "Other",
};

const CATEGORY_COLOURS: Record<EventCategory, string> = {
  markets: "bg-orange-100 text-orange-700 border-orange-200",
  family: "bg-green-100 text-green-700 border-green-200",
  music: "bg-purple-100 text-purple-700 border-purple-200",
  arts: "bg-pink-100 text-pink-700 border-pink-200",
  community: "bg-blue-100 text-blue-700 border-blue-200",
  sport: "bg-red-100 text-red-700 border-red-200",
  food: "bg-amber-100 text-amber-700 border-amber-200",
  tech: "bg-cyan-100 text-cyan-700 border-cyan-200",
  other: "bg-slate-100 text-slate-600 border-slate-200",
};

const INITIAL_COUNT = 3;
const FILTER_CATEGORIES: EventCategory[] = [
  "markets",
  "family",
  "music",
  "arts",
  "food",
  "tech",
  "community",
  "other",
];

function formatEventTime(isoStr: string) {
  return new Date(isoStr).toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Australia/Brisbane",
  });
}

function formatEventDate(isoStr: string) {
  return new Date(isoStr).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Australia/Brisbane",
  });
}

function EventCard({ event }: { event: EventItem }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md">
      {/* Placeholder image area */}
      <div className="relative h-36 bg-gradient-to-br from-slate-100 to-slate-200">
        {event.imageUrl && (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
        )}
        {/* Category tags */}
        <div className="absolute bottom-2 left-2 flex gap-1">
          {event.categories.slice(0, 2).map((cat) => (
            <Label
              key={cat}
              className={`rounded-full border px-2 py-0.5 ${CATEGORY_COLOURS[cat]}`}
            >
              {CATEGORY_LABELS[cat]}
            </Label>
          ))}
          {event.isFree && (
            <Label className="rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-green-700">
              Free
            </Label>
          )}
        </div>
      </div>

      <div className="p-3">
        <CardTitle>{event.title}</CardTitle>
        {event.descriptionShort && (
          <Body className="mt-1 line-clamp-2">{event.descriptionShort}</Body>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {event.venueName && (
            <Caption className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.venueName}
            </Caption>
          )}
          <Caption className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatEventDate(event.startAt)}
          </Caption>
          {!event.allDay && (
            <Caption className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatEventTime(event.startAt)}
            </Caption>
          )}
        </div>
      </div>
    </div>
  );
}

interface EventsPanelProps {
  data: EventsNext7Days;
}

export default function EventsPanel({ data }: EventsPanelProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<EventCategory | null>(null);
  const [freeOnly, setFreeOnly] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const filtered = data.events.filter((e) => {
    const matchesSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.descriptionShort?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      !activeFilter || e.categories.includes(activeFilter);
    const matchesFree = !freeOnly || e.isFree;
    return matchesSearch && matchesFilter && matchesFree;
  });

  const visible = expanded ? filtered : filtered.slice(0, INITIAL_COUNT);
  const hasMore = filtered.length > INITIAL_COUNT;

  return (
    <Section
      title="Events — next 7 days"
      icon={<Calendar className="h-5 w-5 text-primary-500" />}
      fetchedAt={data.meta.fetchedAt}
    >
      {/* Search + filter row */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events..."
            aria-label="Search events"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 sm:w-64"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => {
              setSearch("");
              setActiveFilter(null);
              setFreeOnly(false);
            }}
            aria-pressed={!search && !activeFilter && !freeOnly}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              !search && !activeFilter && !freeOnly
                ? "border-primary-300 bg-primary-50 text-primary-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFreeOnly(!freeOnly)}
            aria-pressed={freeOnly}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              freeOnly
                ? "border-green-200 bg-green-100 text-green-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Free
          </button>
          {FILTER_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setActiveFilter(activeFilter === cat ? null : cat)
              }
              aria-pressed={activeFilter === cat}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                activeFilter === cat
                  ? CATEGORY_COLOURS[cat]
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Event cards grid */}
      {visible.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <Body className="py-8 text-center text-slate-400!">
          No events match your search.
        </Body>
      )}

      {/* View more */}
      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                View more ({filtered.length - INITIAL_COUNT} more){" "}
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}
    </Section>
  );
}
