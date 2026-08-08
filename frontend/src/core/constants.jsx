// Centralized behavioral constants for the app. Magic strings/numbers that
// affect runtime behavior live here as named constants — timers, slice limits,
// time-math units, deep-link state keys, tab keys, and the Open-Meteo API
// config. Seed/content data, CSS values, and already-extracted enums
// (nav_config paths, view_modes Symbols, frequency values, WMO weather codes,
// MS_DAY in date_utils) stay where they are.

// --- Timers ---------------------------------------------------------------
export const CLOCK_TICK_MS = 1000;
export const WEATHER_REFETCH_MS = 15 * 60 * 1000; // 15 min — Open-Meteo `current` cadence

// --- Display limits / slices ---------------------------------------------
export const UPCOMING_LIMIT = 3; // dashboard upcoming events shown
export const HOURLY_FORECAST_COUNT = 4; // hourly forecast entries extracted
export const CHECKLIST_GLANCE_LIMIT = 6; // dashboard checklist glance cap
export const MONTH_CELL_MAX_EVENTS = 3; // event chips per month cell before "+N more"
export const MONTH_GRID_CELLS = 42; // 6 weeks × 7 days covers any month
export const DAYS_PER_WEEK = 7;

// --- Time-math units ------------------------------------------------------
export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = 3600;
export const SECONDS_PER_DAY = 86400;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const MS_PER_MINUTE = 60000;

// --- Date windows / thresholds --------------------------------------------
export const UPCOMING_WINDOW_DAYS = 90; // forward window for expandAll (upcoming)
export const TOMORROW_THRESHOLD_DAYS = 2; // < 2 days away → "tomorrow"
export const GREETING_AFTERNOON_HOUR = 12; // hour < 12 → "Good morning"
export const GREETING_EVENING_HOUR = 18; // hour < 18 → "Good afternoon"

// --- Recurrence safety guards --------------------------------------------
export const FAST_FORWARD_MONTH_GUARD = 12000; // max months jumped in fastForward
export const EXPAND_OCCURRENCE_GUARD = 1000; // max occurrences per event in expand

// --- Cross-feature deep-link state keys ----------------------------------
// Set by the dashboard on navigate(); read by the target feature's hook on
// mount, then cleared. See use_dashboard.goToEvent / goToRecipe.
export const STATE_KEY_EDIT_EVENT_ID = "editEventId";
export const STATE_KEY_EVENT_START = "eventStart";
export const STATE_KEY_EDIT_RECIPE_ID = "editRecipeId";

// --- Meal plan tab keys ---------------------------------------------------
export const TAB_PLANNED = "planned";
export const TAB_RECIPES = "recipes";

// --- Open-Meteo API config ------------------------------------------------
// Open-Meteo is a third-party API (not the project backend); the URL + field
// lists are its contract, centralized here so the fetch is configurable.
export const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
export const OPEN_METEO_CURRENT_FIELDS =
  "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day";
export const OPEN_METEO_HOURLY_FIELDS = "temperature_2m,weather_code,is_day";
export const OPEN_METEO_DAILY_FIELDS = "sunrise,sunset";
export const OPEN_METEO_FORECAST_DAYS = 2; // enough hours to cover late-night rollover

// --- IP geolocation fallback ----------------------------------------------
// Free, no key. Used when navigator.geolocation is unavailable/denied/blocked
// (e.g. dev server reached over LAN http — browsers block geolocation on
// non-secure origins). Returns the browser IP's coarse lat/long (as strings)
// so we can still fetch real Open-Meteo weather for an approximate location.
export const IP_GEO_URL = "https://get.geojs.io/v1/ip/geo.json";