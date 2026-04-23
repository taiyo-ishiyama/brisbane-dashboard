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
  minor: "bg-blue-400",
  info: "bg-slate-300",
};

/* ---------- Traffic column ---------- */

const TRAFFIC_INITIAL = 3;

function TrafficItem({ item }: { item: TrafficIncident }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2.5">
      <span
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${severityDot[item.severity]}`}
      />
      <div className="min-w-0 flex-1">
        <BodyMedium>{item.title}</BodyMedium>
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
        <Car className="h-4 w-4 text-slate-500" />
        Traffic Incidents
      </SubsectionTitle>

      {data.incidents.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 px-3 py-3">
          <ShieldCheck className="h-4 w-4 text-green-700" />
          <Body as="span" className="text-green-700!">All clear</Body>
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
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
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
  train: "bg-emerald-50 text-emerald-700 border-emerald-200",
  bus: "bg-blue-50 text-blue-700 border-blue-200",
  ferry: "bg-cyan-50 text-cyan-700 border-cyan-200",
  tram: "bg-purple-50 text-purple-700 border-purple-200",
  other: "bg-slate-50 text-slate-600 border-slate-200",
};

function TransitAlertItem({ alert }: { alert: TransitAlert }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2.5">
      <span
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${severityDot[alert.severity]}`}
      />
      <div className="min-w-0 flex-1">
        <BodyMedium>{alert.headline}</BodyMedium>
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
            Details <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function TransitColumn({ data }: { data: TransitAlertsFeed }) {
  const [modalMode, setModalMode] = useState<TransitMode | null>(null);

  /* Collect unique modes from alerts */
  const displayModes: TransitMode[] = ["train", "bus", "ferry", "tram"];
  const alertsByMode = displayModes.reduce(
    (acc, mode) => {
      acc[mode] = data.alerts.filter((a) => a.modes?.includes(mode));
      return acc;
    },
    {} as Record<TransitMode, TransitAlert[]>
  );

  /* Count only alerts that belong to at least one displayed mode */
  const alertCount = data.alerts.filter((a) =>
    a.modes?.some((m) => displayModes.includes(m))
  ).length;

  const modalAlerts = modalMode ? alertsByMode[modalMode] : [];
  const ModalIcon = modalMode ? modeIcons[modalMode] : null;

  return (
    <div>
      <SubsectionTitle className="mb-3 flex items-center gap-2">
        <TrainFront className="h-4 w-4 text-slate-500" />
        Public Transport
        {alertCount > 0 && (
          <Label className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
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
              className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-shadow ${modeColours[mode]} ${count > 0 ? "cursor-pointer hover:shadow-md" : "cursor-default"}`}
            >
              <Icon className="h-6 w-6" />
              <Caption className="font-medium!">{modeLabels[mode]}</Caption>
              {count > 0 && (
                <Label className="rounded-full bg-white/60 px-1.5 py-0.5">
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
        Plan your journey <ExternalLink className="h-3 w-3" />
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
          <Body className="py-8 text-center text-slate-400!">
            No alerts for this mode.
          </Body>
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
    <Section title="Disruptions" icon={<AlertCircle className="h-5 w-5 text-amber-500" />} fetchedAt={fetchedAt}>
      <div className="grid gap-6 lg:grid-cols-2">
        <TrafficColumn data={traffic} />
        <TransitColumn data={transit} />
      </div>
    </Section>
  );
}
