import i18n from "../i18n";

export const MS_DAY = 86400000;

// Weekday/month arrays hold i18n KEYS (resolved by the render site or the
// format helpers below via i18n.t). Components subscribed via useTranslation
// re-render on language change and re-call these, so the keys resolve in the
// current language. Keep the Mon-first / Sun-first orderings intact.
export const WEEKDAYS = [
  "dates.weekdayMon", "dates.weekdayTue", "dates.weekdayWed", "dates.weekdayThu",
  "dates.weekdayFri", "dates.weekdaySat", "dates.weekdaySun",
];
// Sun-first (matches Date#getDay, 0=Sun). Used by meal row's weekday label.
export const WEEKDAYS_SUN = [
  "dates.weekdaySun", "dates.weekdayMon", "dates.weekdayTue", "dates.weekdayWed",
  "dates.weekdayThu", "dates.weekdayFri", "dates.weekdaySat",
];
export const WEEKDAYS_LONG = [
  "dates.weekdayLongMon", "dates.weekdayLongTue", "dates.weekdayLongWed", "dates.weekdayLongThu",
  "dates.weekdayLongFri", "dates.weekdayLongSat", "dates.weekdayLongSun",
];
// Sun-first long names (matches Date#getDay, 0=Sun). Used by the dashboard clock.
export const WEEKDAYS_LONG_SUN = [
  "dates.weekdayLongSun", "dates.weekdayLongMon", "dates.weekdayLongTue", "dates.weekdayLongWed",
  "dates.weekdayLongThu", "dates.weekdayLongFri", "dates.weekdayLongSat",
];
export const MONTHS = [
  "dates.monthJan", "dates.monthFeb", "dates.monthMar", "dates.monthApr",
  "dates.monthMay", "dates.monthJun", "dates.monthJul", "dates.monthAug",
  "dates.monthSep", "dates.monthOct", "dates.monthNov", "dates.monthDec",
];
// Short month keys (e.g. "Jan"). Used by the dashboard members birthday label
// and the calendar week title when it spans two months.
export const MONTHS_SHORT = [
  "dates.monthShortJan", "dates.monthShortFeb", "dates.monthShortMar", "dates.monthShortApr",
  "dates.monthShortMay", "dates.monthShortJun", "dates.monthShortJul", "dates.monthShortAug",
  "dates.monthShortSep", "dates.monthShortOct", "dates.monthShortNov", "dates.monthShortDec",
];
// English short weekday tokens, Sun-first. Internal only — zonedParts matches
// the tokens emitted by Intl.DateTimeFormat("en-US", …) against this array to
// recover a 0-6 Sun-first weekday index. Not for display.
const EN_WEEKDAY_SHORT_SUN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

// Monday-based start of week.
export function startOfWeek(d) {
  const x = startOfDay(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  return x;
}

export function endOfWeek(d) {
  const x = startOfWeek(d);
  x.setDate(x.getDate() + 6);
  return endOfDay(x);
}

export function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function addDay(d, n = 1) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function addHour(d, n = 1) {
  const x = new Date(d);
  x.setHours(x.getHours() + n);
  return x;
}

export function addWeek(d, n = 1) {
  return addDay(d, n * 7);
}

export function addMonth(d, n = 1) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function formatTime(d) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// 24-hour HH:MM, locale-independent. Used by the dashboard (no am/pm).
export function formatTime24(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatMonthTitle(d) {
  return `${i18n.t(MONTHS[d.getMonth()])} ${d.getFullYear()}`;
}

export function formatWeekTitle(start, end) {
  const sameMonth = start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${i18n.t(MONTHS[start.getMonth()])} ${start.getDate()} – ${end.getDate()} ${end.getFullYear()}`;
  }
  return `${i18n.t(MONTHS_SHORT[start.getMonth()])} ${start.getDate()} – ${i18n.t(MONTHS_SHORT[end.getMonth()])} ${end.getDate()} ${end.getFullYear()}`;
}

export function formatDayTitle(d) {
  return `${i18n.t(WEEKDAYS_LONG[(d.getDay() + 6) % 7])}, ${d.getDate()} ${i18n.t(MONTHS[d.getMonth()])} ${d.getFullYear()}`;
}

// datetime-local input value (YYYY-MM-DDTHH:MM), local time.
export function toLocalInputValue(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

export function fromLocalInputValue(v) {
  return new Date(v);
}

// dd-mm-yyyy display, e.g. 20-07-2026. Accepts a Date or an ISO "YYYY-MM-DD"
// string (parsed as local to avoid UTC day-shift).
export function formatDate(d) {
  const date = typeof d === "string" ? new Date(`${d}T00:00:00`) : d;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}

// Short weekday label, e.g. "Mon". Accepts a Date or an ISO "YYYY-MM-DD" string.
export function formatWeekdayShort(d) {
  const date = typeof d === "string" ? new Date(`${d}T00:00:00`) : d;
  return i18n.t(WEEKDAYS_SUN[date.getDay()]);
}

// Wall-clock parts of `date` as they read in `timeZone` (IANA name, e.g.
// "America/New_York"). Returns null when `timeZone` is falsy so callers can
// fall back to the Date's local getters. Used by the dashboard clock to show
// the selected weather location's local time instead of the browser's.
//   weekday: 0-6 Sun-first (matches Date#getDay) for indexing WEEKDAYS_LONG_SUN.
export function zonedParts(date, timeZone) {
  if (!timeZone) return null;
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const m = {};
  for (const p of fmt.formatToParts(date)) m[p.type] = p.value;
  // hour12:false can yield "24" at midnight in some environments — normalize.
  const hours = Number(m.hour) % 24;
  return {
    year: Number(m.year),
    month: Number(m.month) - 1, // 0-based, matches Date#getMonth
    day: Number(m.day),
    hours,
    minutes: Number(m.minute),
    seconds: Number(m.second),
    weekday: EN_WEEKDAY_SHORT_SUN.indexOf(m.weekday), // 0-6 Sun-first; -1 if unresolved
  };
}