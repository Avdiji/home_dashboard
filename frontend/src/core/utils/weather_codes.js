// WMO weather interpretation codes used by Open-Meteo.
// Maps a code to { labelKey, icon } (emoji). `labelKey` is an i18n key resolved
// by the render site (weather_card) via t(). `isDay` (1/0/false) swaps the
// clear-sky icon between sun and moon. Unknown codes fall back to weather.unknown.
export function describeWeatherCode(code, isDay = true) {
  if (code == null) return { labelKey: "weather.unknown", icon: "—" };
  const c = Number(code);
  const day = isDay !== false && isDay !== 0;

  if (c === 0) return { labelKey: "weather.clearSky", icon: day ? "☀️" : "🌙" };
  if (c === 1) return { labelKey: "weather.mainlyClear", icon: day ? "🌤️" : "🌙" };
  if (c === 2) return { labelKey: "weather.partlyCloudy", icon: day ? "⛅" : "☁️" };
  if (c === 3) return { labelKey: "weather.overcast", icon: "☁️" };
  if (c === 45 || c === 48) return { labelKey: "weather.fog", icon: "🌫️" };
  if (c >= 51 && c <= 57) return { labelKey: "weather.drizzle", icon: "🌦️" };
  if (c >= 61 && c <= 67) return { labelKey: "weather.rain", icon: "🌧️" };
  if (c === 80) return { labelKey: "weather.rainShowers", icon: "🌦️" };
  if (c === 81 || c === 82) return { labelKey: "weather.heavyShowers", icon: "🌧️" };
  if (c === 85 || c === 86) return { labelKey: "weather.snowShowers", icon: "🌨️" };
  if (c >= 71 && c <= 77) return { labelKey: "weather.snow", icon: "🌨️" };
  if (c >= 95 && c <= 99) return { labelKey: "weather.thunderstorm", icon: "⛈️" };

  return { labelKey: "weather.unknown", icon: "—" };
}