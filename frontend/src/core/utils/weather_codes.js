// WMO weather interpretation codes used by Open-Meteo.
// Maps a code to { label, icon } (emoji). `isDay` (1/0/false) swaps the clear-sky
// icon between sun and moon. Unknown codes fall back to "Unknown".
export function describeWeatherCode(code, isDay = true) {
  if (code == null) return { label: "Unknown", icon: "—" };
  const c = Number(code);
  const day = isDay !== false && isDay !== 0;

  if (c === 0) return { label: "Clear sky", icon: day ? "☀️" : "🌙" };
  if (c === 1) return { label: "Mainly clear", icon: day ? "🌤️" : "🌙" };
  if (c === 2) return { label: "Partly cloudy", icon: day ? "⛅" : "☁️" };
  if (c === 3) return { label: "Overcast", icon: "☁️" };
  if (c === 45 || c === 48) return { label: "Fog", icon: "🌫️" };
  if (c >= 51 && c <= 57) return { label: "Drizzle", icon: "🌦️" };
  if (c >= 61 && c <= 67) return { label: "Rain", icon: "🌧️" };
  if (c === 80) return { label: "Rain showers", icon: "🌦️" };
  if (c === 81 || c === 82) return { label: "Heavy showers", icon: "🌧️" };
  if (c === 85 || c === 86) return { label: "Snow showers", icon: "🌨️" };
  if (c >= 71 && c <= 77) return { label: "Snow", icon: "🌨️" };
  if (c >= 95 && c <= 99) return { label: "Thunderstorm", icon: "⛈️" };

  return { label: "Unknown", icon: "—" };
}