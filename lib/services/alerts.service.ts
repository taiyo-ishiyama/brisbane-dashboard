import { fetchText } from "@/lib/http/fetcher";
import { BOM_RSS_URL, QLD_DISASTER_RSS_URL } from "@/config/sources";
import { normaliseBomRss } from "@/lib/normalizers/bomRss";
import { normaliseQldDisasterRss } from "@/lib/normalizers/qldDisasterRss";
import type { BomWarningsFeed, EmergencyAlertsFeed } from "@/types/alerts";

export async function fetchBomWarnings(): Promise<BomWarningsFeed> {
  const xml = await fetchText(BOM_RSS_URL);
  return normaliseBomRss(xml);
}

export async function fetchQldDisasterAlerts(): Promise<EmergencyAlertsFeed> {
  const xml = await fetchText(QLD_DISASTER_RSS_URL);
  return normaliseQldDisasterRss(xml);
}
