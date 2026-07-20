// Feature-local calendar helper: group occurrences into per-day buckets.
// Both month_view and week_view build identical dayKey + byDay maps — one source.

export function dayKey(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// Returns a Map<dayKey, occ[]> pre-seeded with one empty bucket per day (in
// order), so days with no occurrences still resolve to []. Occurrences whose
// start falls outside the supplied days are dropped (no matching bucket).
export function groupOccurrencesByDay(days, occurrences) {
  const map = new Map();
  for (const day of days) map.set(dayKey(day), []);
  for (const occ of occurrences) {
    const key = dayKey(occ.start);
    if (map.has(key)) map.get(key).push(occ);
  }
  return map;
}