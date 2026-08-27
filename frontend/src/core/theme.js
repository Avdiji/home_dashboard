// Color-mode manager. Owns the `mode` (light | dark | auto), persists it in
// localStorage, and stamps the *resolved* theme on <html data-theme="...">
// ("light" or "dark") — the single thing CSS reads. In Auto mode the resolved
// theme is computed from the dashboard's fetched sunrise/sunset (cached here so
// it applies app-wide, not only on the dashboard); before any weather data
// exists, Auto falls back to the browser's prefers-color-scheme.
//
// Imported in main.jsx before App renders so data-theme is set pre-paint (no
// flash of the wrong theme on load). A 60s interval re-resolves in Auto mode so
// the page flips at sunrise/sunset without a reload.

import {
  THEME_MODE_STORAGE_KEY,
  THEME_SUN_STORAGE_KEY,
  THEME_RESOLVE_INTERVAL_MS,
  THEME_MODES,
} from "./constants";
import { zonedParts } from "./utils/date_utils";

let mode = (() => {
  try {
    const v = localStorage.getItem(THEME_MODE_STORAGE_KEY);
    return THEME_MODES.includes(v) ? v : "auto";
  } catch {
    return "auto";
  }
})();

// Open-Meteo returns sunrise/sunset in the location's local time as
// "YYYY-MM-DDTHH:MM" (no offset). We keep that string plus the location's IANA
// timezone and compare in the location's wall-clock — never the browser's.
let sunrise = null;
let sunset = null;
let tz = null;
(() => {
  try {
    const raw = localStorage.getItem(THEME_SUN_STORAGE_KEY);
    if (!raw) return;
    const p = JSON.parse(raw);
    if (p?.sunrise) sunrise = p.sunrise;
    if (p?.sunset) sunset = p.sunset;
    if (p?.tz) tz = p.tz;
  } catch {
    /* ignore malformed cache */
  }
})();

const listeners = new Set();

// "YYYY-MM-DDTHH:MM[:SS]" → minutes since midnight (location-local). null if
// unparseable.
const parseMin = (iso) => {
  if (!iso) return null;
  const t = iso.split("T")[1];
  if (!t) return null;
  const parts = t.split(":").map(Number);
  if (!Number.isFinite(parts[0]) || !Number.isFinite(parts[1])) return null;
  return parts[0] * 60 + parts[1];
};

// Auto: dark outside the sunrise→sunset window (before sunrise, or at/after
// sunset), computed in the location's local timezone. With no sun cache / tz,
// defer to the OS preference.
const resolveAuto = () => {
  const srMin = parseMin(sunrise);
  const ssMin = parseMin(sunset);
  if (srMin != null && ssMin != null && tz) {
    const loc = zonedParts(new Date(), tz);
    if (loc) {
      const nowMin = loc.hours * 60 + loc.minutes;
      return nowMin < srMin || nowMin >= ssMin ? "dark" : "light";
    }
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const resolveTheme = () =>
  mode === "light" || mode === "dark" ? mode : resolveAuto();

export const getMode = () => mode;

const apply = () => {
  document.documentElement.dataset.theme = resolveTheme();
};

const notify = () => {
  listeners.forEach((fn) => {
    try {
      fn(mode);
    } catch {
      /* a bad listener doesn't break the others */
    }
  });
};

export const setMode = (next) => {
  if (!THEME_MODES.includes(next) || next === mode) return;
  mode = next;
  try {
    localStorage.setItem(THEME_MODE_STORAGE_KEY, next);
  } catch {
    /* localStorage may be unavailable (private mode) — mode still works in-session */
  }
  apply();
  notify();
};

// Cycle light → dark → auto → light.
export const cycleMode = () => {
  const i = THEME_MODES.indexOf(mode);
  setMode(THEME_MODES[(i + 1) % THEME_MODES.length]);
};

// The dashboard calls this when weather arrives (and on each 15-min refetch) so
// Auto becomes sun-aware. Persists the cache so Auto works on every page, not
// just where the weather was fetched.
export const updateSun = (sr, ss, tzVal) => {
  if (!sr || !ss) return;
  sunrise = sr;
  sunset = ss;
  tz = tzVal || null;
  try {
    localStorage.setItem(
      THEME_SUN_STORAGE_KEY,
      JSON.stringify({ sunrise: sr, sunset: ss, tz }),
    );
  } catch {
    /* ignore */
  }
  if (mode === "auto") {
    apply();
    notify();
  }
};

export const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

// Stamp the resolved theme now (pre-render) and re-resolve Auto on an interval
// so sunrise/sunset flips happen live.
apply();
setInterval(() => {
  if (mode === "auto") apply();
}, THEME_RESOLVE_INTERVAL_MS);