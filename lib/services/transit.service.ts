import { fetchBuffer } from "@/lib/http/fetcher";
import { TRANSLINK_GTFSRT_URL } from "@/config/sources";
import { normaliseTranslinkGtfsrt } from "@/lib/normalizers/translinkGtfsrt";
import type { TransitAlertsFeed } from "@/types/transit";

export async function fetchTransitAlerts(): Promise<TransitAlertsFeed> {
  const buffer = await fetchBuffer(TRANSLINK_GTFSRT_URL);
  return normaliseTranslinkGtfsrt(buffer);
}
