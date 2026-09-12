// Resolves the Intl locale/timezone used for every date/time format in the
// app, both sourced from the dashboard's picked weather location (persisted
// in localStorage, see WEATHER_LOCATION_STORAGE_KEY):
//   - getClientLocale(): UI language (i18n) + the location's region
//     (countryCode) — drives 12h vs 24h and date-order conventions (e.g.
//     en-US → "5:30 PM", 06/20/2026; en-DE → "17:30", 20.06.2026).
//   - getClientTimeZone(): the location's IANA timezone — drives actual time
//     CONVERSION, so an event stored as an absolute instant (14:00 in a
//     Berlin-based client) reads as 08:00 on a client whose location is set
//     to New York, not just reformatted 14:00.
// Reads localStorage directly (module-level, no subscription) since every
// formatter call already happens inside a render/derivation that runs on a
// live clock tick or a location change re-render.
import i18n from "./i18n";
import { WEATHER_LOCATION_STORAGE_KEY } from "./constants";

function readLocation() {
  try {
    const raw = localStorage.getItem(WEATHER_LOCATION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getClientLocale() {
  const countryCode = readLocation()?.countryCode ?? null;
  // i18n.language can be region-qualified (e.g. "de-DE") even with
  // load:"languageOnly" — strip any region before appending the location's
  // own region, or combining the two doubles up (e.g. "de-DE-DE").
  const language = i18n.language.split("-")[0];
  return countryCode ? `${language}-${countryCode}` : language;
}

// undefined (not null) so it can be spread straight into Intl options —
// Intl treats an explicit `timeZone: undefined` the same as omitting it
// (falls back to the runtime's own zone).
export function getClientTimeZone() {
  return readLocation()?.timezone || undefined;
}
