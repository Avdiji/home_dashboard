export const MS_DAY = 86400000;

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// Sun-first (matches Date#getDay, 0=Sun). Used by meal row's weekday label.
export const WEEKDAYS_SUN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEKDAYS_LONG = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
// Sun-first long names (matches Date#getDay, 0=Sun). Used by the dashboard clock.
export const WEEKDAYS_LONG_SUN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatWeekTitle(start, end) {
  const sameMonth = start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${MONTHS[start.getMonth()]} ${start.getDate()} – ${end.getDate()} ${end.getFullYear()}`;
  }
  return `${MONTHS[start.getMonth()].slice(0, 3)} ${start.getDate()} – ${MONTHS[end.getMonth()].slice(0, 3)} ${end.getDate()} ${end.getFullYear()}`;
}

export function formatDayTitle(d) {
  return `${WEEKDAYS_LONG[(d.getDay() + 6) % 7]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
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
  return WEEKDAYS_SUN[date.getDay()];
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
    weekday: WEEKDAYS_SUN.indexOf(m.weekday), // 0-6 Sun-first; -1 if unresolved
  };
}