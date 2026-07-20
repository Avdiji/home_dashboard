import { useMemo } from "react";
import {
  WEEKDAYS,
  isSameDay,
  startOfWeek,
  endOfWeek,
  addDay,
  formatTime24,
} from "../../../core/utils/date_utils";
import { expandAll } from "../../../core/utils/recurrence";
import { groupOccurrencesByDay, dayKey } from "../utils/group_by_day";
import { DAYS_PER_WEEK } from "../../../core/constants";
import EventChip from "./event_chip";
import classes from "./week_view.module.css";

export default function WeekView({ cursor, events, persons, onSelectOccurrence, onSelectDay }) {
  const days = useMemo(() => {
    const start = startOfWeek(cursor);
    return Array.from({ length: DAYS_PER_WEEK }, (_, i) => addDay(start, i));
  }, [cursor]);

  const rangeStart = startOfWeek(cursor);
  const rangeEnd = endOfWeek(cursor);

  const occurrences = useMemo(
    () => expandAll(events, rangeStart, rangeEnd),
    [events, rangeStart, rangeEnd],
  );

  const byDay = useMemo(
    () => groupOccurrencesByDay(days, occurrences),
    [days, occurrences],
  );

  const today = new Date();

  return (
    <div className={classes.week}>
      <div className={classes.grid}>
        {days.map((day) => {
          const isToday = isSameDay(day, today);
          const items = byDay.get(dayKey(day)) ?? [];
          return (
            <div
              key={day.toISOString()}
              className={`${classes.col} ${isToday ? classes.today : ""}`}
            >
              <button
                type="button"
                className={classes.dayhead}
                onClick={() => onSelectDay?.(day)}
              >
                <span className={classes.wd}>{WEEKDAYS[(day.getDay() + DAYS_PER_WEEK - 1) % DAYS_PER_WEEK]}</span>
                <span className={classes.dnum}>{day.getDate()}</span>
              </button>
              <div className={classes.events}>
                {items.map((occ) => (
                  <EventChip
                    key={`${occ.event.id}-${occ.start.toISOString()}`}
                    occ={occ}
                    persons={persons}
                    variant="week"
                    onClick={onSelectOccurrence}
                  />
                ))}
                {items.length === 0 && (
                  <span className={classes.empty}>—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}