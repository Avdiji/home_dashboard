import i18n from "../i18n";
import { getClientLocale, getClientTimeZone } from "../locale";

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

// `d` is an absolute instant (a real Date) — formatted in the client's
// configured timezone (getClientTimeZone(), from the dashboard's picked
// weather location) using the client's locale conventions (getClientLocale()):
// 24h for regions that use it (e.g. de-DE: "17:30"), 12h with AM/PM for
// regions that don't (e.g. en-US: "5:30 PM"). This is real timezone
// CONVERSION, not just reformatting — the same instant reads as a different
// clock time depending on the configured location (14:00 in a Berlin client
// is 08:00 in a New York one).
export function formatTime(d) {
  return d.toLocaleTimeString(getClientLocale(), {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: getClientTimeZone(),
  });
}

// Splits a locale-formatted time into { main: "HH:MM" or "H:MM", meridiem }
// so a caller can slot a live seconds readout between the minutes and the
// AM/PM suffix (meridiem is null for 24h locales). Used by the dashboard clock.
export function formatClockParts(d) {
  const parts = new Intl.DateTimeFormat(getClientLocale(), {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: getClientTimeZone(),
  }).formatToParts(d);
  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  const meridiem = parts.find((p) => p.type === "dayPeriod")?.value ?? null;
  return { main: `${hour}:${minute}`, meridiem };
}

// Formats a location-local wall-clock string that carries no UTC offset
// (e.g. Open-Meteo's sunrise/sunset "YYYY-MM-DDTHH:MM", already expressed in
// that location's own time) using the client locale's 12h/24h convention —
// WITHOUT timezone conversion, since the string already IS the wall-clock
// reading; converting it again would double-shift it.
export function formatWallClockTime(iso) {
  if (!iso) return null;
  const [datePart, timePart] = iso.split("T");
  if (!timePart) return null;
  const [y, mo, da] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  const d = new Date(y, mo - 1, da, hh, mm);
  return d.toLocaleTimeString(getClientLocale(), { hour: "2-digit", minute: "2-digit" });
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

// Converts wall-clock fields understood as being in `timeZone` (IANA name)
// into the absolute instant (a Date) they represent. Standard "guess and
// correct" trick: treat the fields as UTC, see how that instant actually
// reads in `timeZone` (an offset-aware round trip via zonedParts), and shift
// by the gap — DST-correct without a timezone database.
function zonedTimeToUtc(y, mo, da, hh, mm, ss, timeZone) {
  const guess = new Date(Date.UTC(y, mo, da, hh, mm, ss));
  const read = zonedParts(guess, timeZone);
  const readAsUtc = Date.UTC(read.year, read.month, read.day, read.hours, read.minutes, read.seconds);
  return new Date(guess.getTime() + (guess.getTime() - readAsUtc));
}

// datetime-local input value (YYYY-MM-DDTHH:MM) showing `d` (an absolute
// instant) as it reads in the client's configured timezone
// (getClientTimeZone(), the dashboard's picked weather location) — falls
// back to the browser's own zone when no location is set.
export function toLocalInputValue(d) {
  const pad = (n) => String(n).padStart(2, "0");
  const timeZone = getClientTimeZone();
  const zp = timeZone && zonedParts(d, timeZone);
  const y = zp ? zp.year : d.getFullYear();
  const mo = zp ? zp.month : d.getMonth();
  const da = zp ? zp.day : d.getDate();
  const hh = zp ? zp.hours : d.getHours();
  const mm = zp ? zp.minutes : d.getMinutes();
  return `${y}-${pad(mo + 1)}-${pad(da)}T${pad(hh)}:${pad(mm)}`;
}

// Inverse of toLocalInputValue: `v` ("YYYY-MM-DDTHH:MM" typed into a form)
// is understood as wall-clock time in the client's configured timezone (not
// the browser's OS zone — the two can differ, e.g. testing a New York
// dashboard from a machine physically in Berlin), and converted to the
// absolute instant it represents. Falls back to plain `new Date(v)` (browser
// zone) when no location is set.
export function fromLocalInputValue(v) {
  const timeZone = getClientTimeZone();
  if (!timeZone) return new Date(v);
  const [datePart, timePart] = v.split("T");
  const [y, mo, da] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  return zonedTimeToUtc(y, mo - 1, da, hh, mm, 0, timeZone);
}

// Locale-aware numeric date, e.g. "20.07.2026" (de-DE) or "07/20/2026"
// (en-US). Accepts a Date (an absolute instant — converted to the client's
// configured timezone, since a late-night instant can land on a different
// calendar day in another zone) or a plain ISO "YYYY-MM-DD" calendar-date
// string (parsed as local midnight and NOT zone-converted — it names a day,
// not an instant, so there is nothing to convert).
export function formatDate(d) {
  const isPlainDateString = typeof d === "string";
  const date = isPlainDateString ? new Date(`${d}T00:00:00`) : d;
  return date.toLocaleDateString(getClientLocale(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(isPlainDateString ? {} : { timeZone: getClientTimeZone() }),
  });
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