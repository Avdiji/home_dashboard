import {
  FREQUENCY_NONE,
  FREQUENCY_DAILY,
  FREQUENCY_WEEKLY,
  FREQUENCY_MONTHLY,
} from "../../core/frequency";
import { MS_DAY } from "../../core/utils/date_utils";

// Step a date forward by one frequency unit.
function step(d, frequency) {
  const x = new Date(d);
  if (frequency === FREQUENCY_DAILY) x.setDate(x.getDate() + 1);
  else if (frequency === FREQUENCY_WEEKLY) x.setDate(x.getDate() + 7);
  else if (frequency === FREQUENCY_MONTHLY) x.setMonth(x.getMonth() + 1);
  return x;
}

// Jump cur forward to just before/at rangeStart to avoid iterating thousands
// of occurrences for long-running recurring events.
function fastForward(cur, frequency, rangeStart) {
  if (cur >= rangeStart) return cur;
  if (frequency === FREQUENCY_DAILY) {
    const days = Math.floor((rangeStart - cur) / MS_DAY);
    return new Date(cur.getTime() + days * MS_DAY);
  }
  if (frequency === FREQUENCY_WEEKLY) {
    const weeks = Math.floor((rangeStart - cur) / (7 * MS_DAY));
    return new Date(cur.getTime() + weeks * 7 * MS_DAY);
  }
  // Monthly: months vary in length, loop is safe (max ~months between dates).
  let c = new Date(cur);
  let guard = 0;
  while (c < rangeStart && guard < 12000) {
    c.setMonth(c.getMonth() + 1);
    guard++;
  }
  return c;
}

// Expand an event into concrete occurrences overlapping [rangeStart, rangeEnd].
// Returns array of { event, start, end }.
export function expandOccurrences(event, rangeStart, rangeEnd) {
  const out = [];
  const dur = event.end.getTime() - event.start.getTime();

  if (event.frequency === FREQUENCY_NONE) {
    if (event.start <= rangeEnd && event.end >= rangeStart) {
      out.push({ event, start: event.start, end: event.end });
    }
    return out;
  }

  let cur = fastForward(event.start, event.frequency, rangeStart);
  let guard = 0;
  while (cur <= rangeEnd && guard < 1000) {
    const occEnd = new Date(cur.getTime() + dur);
    if (occEnd >= rangeStart) {
      out.push({ event, start: new Date(cur), end: occEnd });
    }
    cur = step(cur, event.frequency);
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