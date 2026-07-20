import { useMemo } from "react";
import {
  WEEKDAYS,
  isSameDay,
  startOfWeek,
  endOfWeek,
  addDay,
  formatTime,
} from "../../../core/utils/date_utils";
import { expandAll } from "../recurrence";
import { groupOccurrencesByDay, dayKey } from "../utils/group_by_day";
import EventChip from "./event_chip";
import classes from "./week_view.module.css";

export default function WeekView({ cursor, events, persons, onSelectOccurrence, onSelectDay }) {
  const days = useMemo(() => {
    const start = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, i) => addDay(start, i));
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
                <span className={classes.wd}>{WEEKDAYS[(day.getDay() + 6) % 7]}</span>
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