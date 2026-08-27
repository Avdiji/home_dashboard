import {
  FREQUENCY_NONE,
  FREQUENCY_DAILY,
  FREQUENCY_WEEKLY,
  FREQUENCY_MONTHLY,
  FREQUENCY_YEARLY,
} from "../frequency";
import { MS_DAY } from "./date_utils";
import {
  DAYS_PER_WEEK,
  FAST_FORWARD_MONTH_GUARD,
  EXPAND_OCCURRENCE_GUARD,
} from "../constants";

// Step a date forward by one frequency unit, repeated `interval` times.
function step(d, frequency, interval) {
  const n = interval || 1;
  const x = new Date(d);
  if (frequency === FREQUENCY_DAILY) x.setDate(x.getDate() + n);
  else if (frequency === FREQUENCY_WEEKLY) x.setDate(x.getDate() + n * DAYS_PER_WEEK);
  else if (frequency === FREQUENCY_MONTHLY) x.setMonth(x.getMonth() + n);
  else if (frequency === FREQUENCY_YEARLY) x.setFullYear(x.getFullYear() + n);
  return x;
}

// Jump cur forward to just before/at rangeStart to avoid iterating thousands
// of occurrences for long-running recurring events. interval scales the jump.
function fastForward(cur, frequency, interval, rangeStart) {
  const n = interval || 1;
  if (cur >= rangeStart) return cur;
  if (frequency === FREQUENCY_DAILY) {
    const days = Math.floor((rangeStart - cur) / (n * MS_DAY));
    return new Date(cur.getTime() + days * n * MS_DAY);
  }
  if (frequency === FREQUENCY_WEEKLY) {
    const weeks = Math.floor((rangeStart - cur) / (n * DAYS_PER_WEEK * MS_DAY));
    return new Date(cur.getTime() + weeks * n * DAYS_PER_WEEK * MS_DAY);
  }
  // Monthly + yearly: units vary in length (months/years aren't a fixed ms
  // count), so loop in unit steps. Bounded by FAST_FORWARD_MONTH_GUARD — even
  // yearly over many years stays well under it (12000 iterations max).
  let c = new Date(cur);
  let guard = 0;
  while (c < rangeStart && guard < FAST_FORWARD_MONTH_GUARD) {
    if (frequency === FREQUENCY_YEARLY) c.setFullYear(c.getFullYear() + n);
    else c.setMonth(c.getMonth() + n);
    guard++;
  }
  return c;
}

// Expand an event into concrete occurrences overlapping [rangeStart, rangeEnd].
// Returns array of { event, start, end }. Occurrences whose start is listed in
// event.exclusions (ISO strings — a deleted-this-only instance) are skipped.
export function expandOccurrences(event, rangeStart, rangeEnd) {
  const out = [];
  const dur = event.end.getTime() - event.start.getTime();
  const interval = event.interval || 1;
  const excluded = new Set(event.exclusions ?? []);

  if (event.frequency === FREQUENCY_NONE) {
    if (event.start <= rangeEnd && event.end >= rangeStart) {
      out.push({ event, start: event.start, end: event.end });
    }
    return out;
  }

  let cur = fastForward(event.start, event.frequency, interval, rangeStart);
  let guard = 0;
  while (cur <= rangeEnd && guard < EXPAND_OCCURRENCE_GUARD) {
    const occEnd = new Date(cur.getTime() + dur);
    if (occEnd >= rangeStart && !excluded.has(cur.toISOString())) {
      out.push({ event, start: new Date(cur), end: occEnd });
    }
    cur = step(cur, event.frequency, interval);
    guard++;
  }
  return out;
}

// Expand a whole list of events into occurrences within a range, sorted by
// start time.
export function expandAll(events, rangeStart, rangeEnd) {
  const all = [];
  for (const event of events) {
    all.push(...expandOccurrences(event, rangeStart, rangeEnd));
  }
  all.sort((a, b) => a.start - b.start);
  return all;
}