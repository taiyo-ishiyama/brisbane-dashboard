"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, MapPin, Clock, Search, ExternalLink } from "lucide-react";
import type { EventsNext7Days, EventCategory, EventItem } from "@/types/events";
import { CardTitle, Body, Caption, Label } from "@/components/ui/Typography";
import Section from "@/components/layout/Section";
import Modal from "@/components/ui/Modal";

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
  markets: "bg-orange-50 text-orange-700 border-orange-200",
  family: "bg-emerald-50 text-emerald-700 border-emerald-200",
  music: "bg-violet-50 text-violet-700 border-violet-200",
  arts: "bg-pink-50 text-pink-700 border-pink-200",
  community: "bg-sky-50 text-sky-700 border-sky-200",
  sport: "bg-red-50 text-red-700 border-red-200",
  food: "bg-amber-50 text-amber-700 border-amber-200",
  tech: "bg-cyan-50 text-cyan-700 border-cyan-200",
  other: "bg-stone-100 text-stone-600 border-stone-200",
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
  const Wrapper = event.sourceUrl ? "a" : "div";
  const linkProps = event.sourceUrl
    ? { href: event.sourceUrl, target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <Wrapper
      {...linkProps}
      className="group overflow-hidden rounded-xl border border-stone-200/60 bg-white transition-shadow hover:shadow-md"
    >
      {/* Image area */}
      <div className="relative h-36 bg-stone-100">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Calendar className="size-8 text-stone-300" />
          </div>
        )}
        {/* Category tags */}
        <div className="absolute bottom-2 left-2 flex gap-1">
          {event.categories.slice(0, 2).map((cat) => (
            <Label
              key={cat}
              className={`rounded-full border px-2 py-0.5 backdrop-blur-sm ${CATEGORY_COLOURS[cat]}`}
            >
              {CATEGORY_LABELS[cat]}
            </Label>
          ))}
          {event.isFree && (
            <Label className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700 backdrop-blur-sm">
              Free
            </Label>
          )}
        </div>
      </div>

      <div className="p-3">
        <CardTitle className="transition-colors group-hover:text-primary-700 line-clamp-2">
          {event.title}
          {event.sourceUrl && (
            <ExternalLink className="ml-1 inline size-3 text-stone-400 group-hover:text-primary-500" />
          )}
        </CardTitle>
        {event.descriptionShort && (
          <Body className="mt-1 line-clamp-2">{event.descriptionShort}</Body>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {event.venueName && (
            <Caption className="inline-flex items-center gap-1 truncate">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{event.venueName}</span>
            </Caption>
          )}
          <Caption className="inline-flex items-center gap-1 tabular-nums">
            <Calendar className="size-3 shrink-0" />
            {formatEventDate(event.startAt)}
          </Caption>
          {!event.allDay && (
            <Caption className="inline-flex items-center gap-1 tabular-nums">
              <Clock className="size-3 shrink-0" />
              {formatEventTime(event.startAt)}
            </Caption>
          )}
        </div>
      </div>
    </Wrapper>
  );
}

interface EventsPanelProps {
  data: EventsNext7Days;
}

function EventFilters({
  search,
  setSearch,
  activeFilter,
  setActiveFilter,
  freeOnly,
  setFreeOnly,
}: {
  search: string;
  setSearch: (v: string) => void;
  activeFilter: EventCategory | null;
  setActiveFilter: (v: EventCategory | null) => void;
  freeOnly: boolean;
  setFreeOnly: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          placeholder="Search events..."
          aria-label="Search events"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-stone-200 bg-white py-2 pl-9 pr-3 text-sm text-stone-700 placeholder-stone-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 sm:w-64"
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
              : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFreeOnly(!freeOnly)}
          aria-pressed={freeOnly}
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            freeOnly
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
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
                : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>
    </div>
  );
}

function filterEvents(
  events: EventItem[],
  search: string,
  activeFilter: EventCategory | null,
  freeOnly: boolean,
) {
  return events.filter((e) => {
    const matchesSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.descriptionShort?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      !activeFilter || e.categories.includes(activeFilter);
    const matchesFree = !freeOnly || e.isFree;
    return matchesSearch && matchesFilter && matchesFree;
  });
}

export default function EventsPanel({ data }: EventsPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<EventCategory | null>(null);
  const [freeOnly, setFreeOnly] = useState(false);

  const preview = data.events.slice(0, INITIAL_COUNT);
  const modalFiltered = filterEvents(data.events, search, activeFilter, freeOnly);

  function handleCloseModal() {
    setModalOpen(false);
    setSearch("");
    setActiveFilter(null);
    setFreeOnly(false);
  }

  return (
    <Section
      title="Events — next 7 days"
      icon={<Calendar className="size-5 text-primary-500" />}
      fetchedAt={data.meta.fetchedAt}
    >
      {data.events.length === 0 ? (
        <div className="rounded-xl border border-stone-200/60 bg-white px-6 py-12 text-center">
          <Calendar className="mx-auto size-8 text-stone-300" />
          <Body className="mt-3 text-stone-400!">No events in the next 7 days.</Body>
        </div>
      ) : (
        <>
          {/* Preview cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {preview.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* View all button */}
          {data.events.length > INITIAL_COUNT && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 hover:text-primary-700"
              >
                View all events ({data.events.length})
              </button>
            </div>
          )}

          {/* Full events modal */}
          <Modal
            open={modalOpen}
            onClose={handleCloseModal}
            title={`Events — next 7 days (${data.events.length})`}
            toolbar={
              <EventFilters
                search={search}
                setSearch={setSearch}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                freeOnly={freeOnly}
                setFreeOnly={setFreeOnly}
              />
            }
          >
            {modalFiltered.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {modalFiltered.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Search className="mx-auto size-8 text-stone-300" />
                <Body className="mt-3 text-stone-400!">
                  No events match your search.
                </Body>
              </div>
            )}
          </Modal>
        </>
      )}
    </Section>
  );
}
