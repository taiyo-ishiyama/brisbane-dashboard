const BRISBANE_LAT = -27.47;
const BRISBANE_LON = 153.03;

export const OPEN_METEO_URL =
  `https://api.open-meteo.com/v1/forecast` +
  `?latitude=${BRISBANE_LAT}&longitude=${BRISBANE_LON}` +
  `&daily=weather_code,temperature_2m_max,temperature_2m_min,` +
  `precipitation_sum,precipitation_probability_max,` +
  `wind_speed_10m_max,wind_direction_10m_dominant` +
  `&timezone=Australia/Brisbane`;

// BCC Events – OpenDataSoft v2.1 API
// Date range params are appended dynamically by the service
export const BCC_EVENTS_BASE_URL =
  "https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/brisbane-city-council-events/records";

// Placeholder URLs for future data sources
export const BOM_RSS_URL =
  "https://reg.bom.gov.au/fwo/IDZ00056.warnings_qld.xml";
export const QLD_TRAFFIC_BASE_URL =
  "https://api.qldtraffic.qld.gov.au/v2/events";
export const QLD_DISASTER_RSS_URL =
  "https://publiccontent-qld-alerts.s3.ap-southeast-2.amazonaws.com/content/Feeds/QLDEmergencyAlerts/QLDEmergencyAlerts.xml";
export const TRANSLINK_GTFSRT_URL =
  "https://gtfsrt.api.translink.com.au/api/realtime/SEQ/alerts";
