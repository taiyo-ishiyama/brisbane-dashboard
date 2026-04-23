"use client";

import { useState, type ComponentType } from "react";
import {
  Car,
  TrainFront,
  Bus,
  Ship,
  TramFront,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import type { TrafficIncidentsFeed, TrafficIncident } from "@/types/traffic";
import type { TransitAlertsFeed, TransitAlert, TransitMode } from "@/types/transit";
import type { Severity } from "@/types/dashboard";
import { SubsectionTitle, BodyMedium, Body, Caption, Tiny, Label } from "@/components/ui/Typography";
import Section from "@/components/layout/Section";
import Modal from "@/components/ui/Modal";

/* ---------- shared ---------- */

const severityDot: Record<Severity, string> = {
  extreme: "bg-red-500",
  severe: "bg-orange-500",
  moderate: "bg-amber-400",
  minor: "bg-sky-400",
  info: "bg-stone-300",
};

/* ---------- Traffic column ---------- */

const TRAFFIC_INITIAL = 3;

function TrafficItem({ item }: { item: TrafficIncident }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-stone-100 bg-white px-3 py-2.5">
      <span
        className={`mt-1.5 size-2 shrink-0 rounded-full ${severityDot[item.severity]}`}
      />
      <div className="min-w-0 flex-1">
        <BodyMedium className="text-pretty">{item.title}</BodyMedium>
        {item.description && (
          <Caption as="p" className="mt-0.5 line-clamp-2">
            {item.description}
          </Caption>
        )}
        {item.locationText && (
          <Tiny as="p" className="mt-1">{item.locationText}</Tiny>
        )}
      </div>
    </div>
  );
}

function TrafficColumn({ data }: { data: TrafficIncidentsFeed }) {
  const [modalOpen, setModalOpen] = useState(false);
  const preview = data.incidents.slice(0, TRAFFIC_INITIAL);
  const hasMore = data.incidents.length > TRAFFIC_INITIAL;

  return (
    <div>
      <SubsectionTitle className="mb-3 flex items-center gap-2">
        <Car className="size-4 text-stone-400" />
        Traffic Incidents
        {data.incidents.length > 0 && (
          <Label className="rounded-full bg-stone-100 px-2 py-0.5 text-stone-600 tabular-nums">
            {data.incidents.length}
          </Label>
        )}
      </SubsectionTitle>

      {data.incidents.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-3">
          <ShieldCheck className="size-4 text-emerald-600" />
          <Body as="span" className="text-emerald-700!">All clear</Body>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {preview.map((item) => (
              <TrafficItem key={item.id} item={item} />
            ))}
          </div>

          {hasMore && (
            <button
              onClick={() => setModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              View all incidents ({data.incidents.length})
            </button>
          )}

          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title={`Traffic Incidents (${data.incidents.length})`}
          >
            <div className="space-y-2">
              {data.incidents.map((item) => (
                <TrafficItem key={item.id} item={item} />
              ))}
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}

/* ---------- Transit column ---------- */

const modeIcons: Record<TransitMode, ComponentType<{ className?: string }>> = {
  train: TrainFront,
  bus: Bus,
  ferry: Ship,
  tram: TramFront,
  other: AlertCircle,
};

const modeLabels: Record<TransitMode, string> = {
  train: "Train",
  bus: "Bus",
  ferry: "CityCat",
  tram: "Light Rail",
  other: "Other",
};

const modeColours: Record<TransitMode, string> = {
  train: "bg-emerald-50/80 text-emerald-700 border-emerald-200/60",
  bus: "bg-sky-50/80 text-sky-700 border-sky-200/60",
  ferry: "bg-cyan-50/80 text-cyan-700 border-cyan-200/60",
  tram: "bg-violet-50/80 text-violet-700 border-violet-200/60",
  other: "bg-stone-50 text-stone-600 border-stone-200",
};

function TransitAlertItem({ alert }: { alert: TransitAlert }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-stone-100 bg-white px-3 py-2.5">
      <span
        className={`mt-1.5 size-2 shrink-0 rounded-full ${severityDot[alert.severity]}`}
      />
      <div className="min-w-0 flex-1">
        <BodyMedium className="text-pretty">{alert.headline}</BodyMedium>
        {alert.description && alert.description !== alert.headline && (
          <Caption as="p" className="mt-0.5 line-clamp-3">
            {alert.description}
          </Caption>
        )}
        {alert.sourceUrl && (
          <a
            href={alert.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            Details <ExternalLink className="size-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function TransitColumn({ data }: { data: TransitAlertsFeed }) {
  const [modalMode, setModalMode] = useState<TransitMode | null>(null);

  const displayModes: TransitMode[] = ["train", "bus", "ferry", "tram"];
  const alertsByMode = displayModes.reduce(
    (acc, mode) => {
      acc[mode] = data.alerts.filter((a) => a.modes?.includes(mode));
      return acc;
    },
    {} as Record<TransitMode, TransitAlert[]>
  );

  const alertCount = data.alerts.filter((a) =>
    a.modes?.some((m) => displayModes.includes(m))
  ).length;

  const modalAlerts = modalMode ? alertsByMode[modalMode] : [];

  return (
    <div>
      <SubsectionTitle className="mb-3 flex items-center gap-2">
        <TrainFront className="size-4 text-stone-400" />
        Public Transport
        {alertCount > 0 && (
          <Label className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 tabular-nums">
            {alertCount} alert{alertCount !== 1 ? "s" : ""}
          </Label>
        )}
      </SubsectionTitle>

      <div className="grid grid-cols-2 gap-2">
        {displayModes.map((mode) => {
          const Icon = modeIcons[mode];
          const count = alertsByMode[mode].length;
          return (
            <button
              key={mode}
              onClick={() => count > 0 && setModalMode(mode)}
              aria-label={`${modeLabels[mode]}: ${count} alert${count !== 1 ? "s" : ""}`}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-shadow ${modeColours[mode]} ${count > 0 ? "cursor-pointer hover:shadow-sm" : "cursor-default"}`}
            >
              <Icon className="size-6" />
              <Caption className="font-medium!">{modeLabels[mode]}</Caption>
              {count > 0 && (
                <Label className="rounded-full bg-white/60 px-1.5 py-0.5 tabular-nums">
                  {count} alert{count !== 1 ? "s" : ""}
                </Label>
              )}
            </button>
          );
        })}
      </div>

      <a
        href="https://translink.com.au/service-updates"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
      >
        Plan your journey <ExternalLink className="size-3" />
      </a>

      <Modal
        open={modalMode !== null}
        onClose={() => setModalMode(null)}
        title={modalMode ? `${modeLabels[modalMode]} Alerts (${modalAlerts.length})` : ""}
      >
        {modalAlerts.length > 0 ? (
          <div className="space-y-2">
            {modalAlerts.map((alert) => (
              <TransitAlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <AlertCircle className="mx-auto size-8 text-stone-300" />
            <Body className="mt-3 text-stone-400!">
              No alerts for this mode.
            </Body>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ---------- Combined ---------- */

interface DisruptionsPanelProps {
  traffic: TrafficIncidentsFeed;
  transit: TransitAlertsFeed;
  fetchedAt: string;
}

export default function DisruptionsPanel({
  traffic,
  transit,
  fetchedAt,
}: DisruptionsPanelProps) {
  return (
    <Section title="Disruptions" icon={<AlertCircle className="size-5 text-amber-500" />} fetchedAt={fetchedAt}>
      <div className="grid gap-6 lg:grid-cols-2">
        <TrafficColumn data={traffic} />
        <TransitColumn data={transit} />
      </div>
    </Section>
  );
}
