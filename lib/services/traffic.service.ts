import { fetchJson } from "@/lib/http/fetcher";
import { QLD_TRAFFIC_BASE_URL } from "@/config/sources";
import { serverEnv } from "@/lib/env/server";
import { normaliseQldTraffic } from "@/lib/normalizers/qldTraffic";
import type { QldTrafficGeoJson } from "@/lib/normalizers/qldTraffic";
import type { TrafficIncidentsFeed } from "@/types/traffic";

export async function fetchTraffic(): Promise<TrafficIncidentsFeed> {
  const url = `${QLD_TRAFFIC_BASE_URL}?apikey=${serverEnv.QLD_TRAFFIC_API_KEY}`;
  const raw = await fetchJson<QldTrafficGeoJson>(url);
  return normaliseQldTraffic(raw);
}
