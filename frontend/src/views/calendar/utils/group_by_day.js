// Feature-local calendar helper: group occurrences into per-day buckets.
// Both month_view and week_view build identical dayKey + byDay maps — one source.

import { startOfDay, endOfDay } from "../../../core/utils/date_utils";

export function dayKey(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// Returns a Map<dayKey, occ[]> pre-seeded with one empty bucket per day (in
// order), so days with no occurrences still resolve to []. A multi-day
// occurrence (end date past its start date) is bucketed into every day it
// overlaps, not just its start day, so it shows up on each day it spans.
export function groupOccurrencesByDay(days, occurrences) {
  const map = new Map();
  for (const day of days) map.set(dayKey(day), []);
  for (const day of days) {
    const key = dayKey(day);
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    for (const occ of occurrences) {
      if (occ.end >= dayStart && occ.start <= dayEnd) {
        map.get(key).push(occ);
      }
    }
  }
  return map;
}