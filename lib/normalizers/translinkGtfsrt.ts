import { transit_realtime } from "gtfs-realtime-bindings";
import type { TransitAlert, TransitAlertsFeed, TransitMode } from "@/types/transit";
import type { SectionMeta, Severity } from "@/types/dashboard";

const { Alert } = transit_realtime;

function firstTranslation(
  ts: transit_realtime.ITranslatedString | null | undefined,
): string | undefined {
  return ts?.translation?.[0]?.text ?? undefined;
}

function mapSeverity(alert: transit_realtime.IAlert): Severity {
  const effect = alert.effect;

  // Effect-based overrides take priority
  if (effect === Alert.Effect.NO_SERVICE) return "severe";
  if (effect === Alert.Effect.SIGNIFICANT_DELAYS) return "moderate";
  if (
    effect === Alert.Effect.REDUCED_SERVICE ||
    effect === Alert.Effect.DETOUR ||
    effect === Alert.Effect.STOP_MOVED ||
    effect === Alert.Effect.MODIFIED_SERVICE
  ) return "minor";

  switch (alert.severityLevel) {
    case Alert.SeverityLevel.SEVERE:
      return "severe";
    case Alert.SeverityLevel.WARNING:
      return "moderate";
    case Alert.SeverityLevel.INFO:
    default:
      return "info";
  }
}

function mapRouteType(routeType: number | null | undefined): TransitMode {
  switch (routeType) {
    case 0:
      return "tram";
    case 1:
    case 2:
      return "train";
    case 3:
      return "bus";
    case 4:
      return "ferry";
    default:
      return "other";
  }
}

const SEVERITY_ORDER: Record<Severity, number> = {
  extreme: 0,
  severe: 1,
  moderate: 2,
  minor: 3,
  info: 4,
};

function unixToIso(
  ts: number | { toNumber(): number } | null | undefined,
): string | undefined {
  if (ts == null) return undefined;
  const num = typeof ts === "number" ? ts : ts.toNumber();
  if (num === 0) return undefined;
  return new Date(num * 1000).toISOString();
}

function toTransitAlert(entity: transit_realtime.IFeedEntity): TransitAlert | null {
  const alert = entity.alert;
  if (!alert) return null;

  const headline =
    firstTranslation(alert.headerText) ??
    firstTranslation(alert.descriptionText);
  if (!headline) return null;

  const informedEntities = alert.informedEntity ?? [];

  // Deduplicated modes
  const modesSet = new Set<TransitMode>();
  const routes: string[] = [];
  const stops: string[] = [];

  for (const ie of informedEntities) {
    if (ie.routeType != null) modesSet.add(mapRouteType(ie.routeType));
    if (ie.routeId) routes.push(ie.routeId);
    if (ie.stopId) stops.push(ie.stopId);
  }

  // Derive min start / max end across all active periods
  const periods = alert.activePeriod ?? [];
  let activeFrom: string | undefined;
  let activeTo: string | undefined;

  if (periods.length > 0) {
    let minStart: number | undefined;
    let maxEnd: number | undefined;

    for (const p of periods) {
      const s = p.start != null
        ? (typeof p.start === "number" ? p.start : (p.start as { toNumber(): number }).toNumber())
        : undefined;
      const e = p.end != null
        ? (typeof p.end === "number" ? p.end : (p.end as { toNumber(): number }).toNumber())
        : undefined;

      if (s && (minStart === undefined || s < minStart)) minStart = s;
      if (e && (maxEnd === undefined || e > maxEnd)) maxEnd = e;
    }

    activeFrom = unixToIso(minStart);
    activeTo = unixToIso(maxEnd);
  }

  return {
    id: entity.id,
    severity: mapSeverity(alert),
    headline,
    description: firstTranslation(alert.descriptionText),
    modes: modesSet.size > 0 ? [...modesSet] : undefined,
    routes: routes.length > 0 ? [...new Set(routes)] : undefined,
    stops: stops.length > 0 ? [...new Set(stops)] : undefined,
    activeFrom,
    activeTo,
    sourceName: "TransLink",
    sourceUrl: firstTranslation(alert.url),
  };
}

export function normaliseTranslinkGtfsrt(buffer: Uint8Array): TransitAlertsFeed {
  const feed = transit_realtime.FeedMessage.decode(buffer);

  const alerts: TransitAlert[] = [];
  for (const entity of feed.entity) {
    const alert = toTransitAlert(entity);
    if (alert) alerts.push(alert);
  }

  // Sort most severe first
  alerts.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  const meta: SectionMeta = {
    source: "TransLink",
    fetchedAt: new Date().toISOString(),
  };

  return { meta, alerts };
}
