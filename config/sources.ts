const BRISBANE_LAT = -27.47;
const BRISBANE_LON = 153.03;

export const OPEN_METEO_URL =
  `https://api.open-meteo.com/v1/forecast` +
  `?latitude=${BRISBANE_LAT}&longitude=${BRISBANE_LON}` +
  `&daily=weather_code,temperature_2m_max,temperature_2m_min,` +
  `precipitation_sum,precipitation_probability_max,` +
  `wind_speed_10m_max,wind_direction_10m_dominant` +
  `&timezone=Australia/Brisbane`;

// Placeholder URLs for future data sources
export const BOM_RSS_URL = "TODO";
export const BCC_EVENTS_URL = "TODO";
export const QLD_TRAFFIC_URL = "TODO";
export const QLD_DISASTER_RSS_URL = "TODO";
export const TRANSLINK_GTFSRT_URL = "TODO";
