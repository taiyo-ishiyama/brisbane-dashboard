import type {
  TrafficIncident,
  TrafficIncidentsFeed,
  TrafficType,
} from "@/types/traffic";
import type { SectionMeta, Severity, GeoPoint } from "@/types/dashboard";

// Brisbane metro LGAs used for filtering statewide events
const BRISBANE_METRO_LGAS = new Set([
  "Brisbane City",
  "Moreton Bay Regional",
  "Logan City",
  "Ipswich City",
  "Redland City",
]);

interface QldTrafficFeature {
  type: "Feature";
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
  properties: {
    id: number;
    event_type: string;
    event_subtype: string | null;
    event_priority: string;
    description: string;
    advice: string | null;
    impact: {
      direction: string | null;
      impact_type: string | null;
      impact_subtype: string | null;
      delay: string | null;
    } | null;
    duration: {
      start: string | null;
      end: string | null;
    } | null;
    road_summary: {
      road_name: string | null;
      locality: string | null;
      local_government_area: string | null;
      district: string | null;
    } | null;
    url: string | null;
    last_updated: string | null;
  };
}

export interface QldTrafficGeoJson {
  type: "FeatureCollection";
  features: QldTrafficFeature[];
}

function mapEventType(eventType: string): TrafficType {
  switch (eventType.toLowerCase()) {
    case "crash":
      return "crash";
    case "roadworks":
      return "roadworks";
    case "hazard":
      return "hazard";
    case "congestion":
      return "congestion";
    case "flooding":
      return "flooding";
    default:
      return "other";
  }
}

function mapSeverity(feature: QldTrafficFeature): Severity {
  const priority = feature.properties.event_priority;
  const impactType = feature.properties.impact?.impact_type;

  // Closures are always at least moderate
  if (impactType === "Closures") {
    if (priority === "High") return "severe";
    return "moderate";
  }

  switch (priority) {
    case "High":
      return "severe";
    case "Medium":
      return "moderate";
    case "Low":
      return "minor";
    default:
      return "info";
  }
}

function extractPoint(geometry: QldTrafficFeature["geometry"]): GeoPoint | undefined {
  const coords = geometry.coordinates;
  if (!coords || !Array.isArray(coords) || coords.length === 0) return undefined;

  // MultiPoint: [[lon, lat], ...]
  if (geometry.type === "MultiPoint" && Array.isArray(coords[0])) {
    const [lon, lat] = coords[0] as number[];
    return { lat, lon };
  }

  // MultiLineString: [[[lon, lat], ...], ...]
  if (geometry.type === "MultiLineString" && Array.isArray(coords[0])) {
    const firstLine = coords[0] as number[][];
    if (Array.isArray(firstLine[0])) {
      const [lon, lat] = firstLine[0] as number[];
      return { lat, lon };
    }
  }

  // Point: [lon, lat]
  if (geometry.type === "Point" && typeof coords[0] === "number") {
    const [lon, lat] = coords as number[];
    return { lat, lon };
  }

  return undefined;
}

function buildTitle(feature: QldTrafficFeature): string {
  const props = feature.properties;
  const road = props.road_summary?.road_name;
  const subtype = props.event_subtype;

  if (road && subtype) return `${subtype} — ${road}`;
  if (road) return `${props.event_type} — ${road}`;
  if (subtype) return subtype;
  return props.event_type;
}

function isBrisbaneMetro(feature: QldTrafficFeature): boolean {
  const lga = feature.properties.road_summary?.local_government_area ?? "";
  // Handle multi-LGA values like "Brisbane City / Moreton Bay Regional"
  return lga.split("/").some((part) => BRISBANE_METRO_LGAS.has(part.trim()));
}

function toTrafficIncident(feature: QldTrafficFeature): TrafficIncident {
  const props = feature.properties;

  return {
    id: String(props.id),
    type: mapEventType(props.event_type),
    severity: mapSeverity(feature),
    title: buildTitle(feature),
    description: props.description?.trim() || undefined,
    locationText: props.road_summary?.road_name ?? undefined,
    suburb: props.road_summary?.locality ?? undefined,
    point: extractPoint(feature.geometry),
    startedAt: props.duration?.start
      ? new Date(props.duration.start).toISOString()
      : undefined,
    updatedAt: props.last_updated
      ? new Date(props.last_updated).toISOString()
      : undefined,
    sourceUrl: props.url ?? undefined,
  };
}

const SEVERITY_ORDER: Record<Severity, number> = {
  extreme: 0,
  severe: 1,
  moderate: 2,
  minor: 3,
  info: 4,
};

export function normaliseQldTraffic(raw: QldTrafficGeoJson): TrafficIncidentsFeed {
  const brisbaneFeatures = raw.features.filter(isBrisbaneMetro);
  const incidents = brisbaneFeatures.map(toTrafficIncident);

  // Sort most severe first, then by most recently updated
  incidents.sort((a, b) => {
    const sevDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (sevDiff !== 0) return sevDiff;
    const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return bTime - aTime;
  });

  const meta: SectionMeta = {
    source: "QLDTraffic",
    fetchedAt: new Date().toISOString(),
  };

  return { meta, incidents };
}
