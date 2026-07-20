import { useMemo } from "react";
import {
  WEEKDAYS,
  isSameDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  addDay,
} from "../../../core/utils/date_utils";
import { expandAll } from "../recurrence";
import { groupOccurrencesByDay, dayKey } from "../utils/group_by_day";
import EventChip from "./event_chip";
import classes from "./month_view.module.css";

const MAX_PER_CELL = 3;

export default function MonthView({ cursor, events, persons, onSelectOccurrence, onSelectDay }) {
  const cells = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = startOfMonth(cursor);
    end.setMonth(end.getMonth() + 1);
    // 6 weeks = 42 cells covers any month.
    const days = [];
    for (let i = 0; i < 42; i++) {
      days.push(addDay(start, i));
    }
    return days;
  }, [cursor]);

  const occurrences = useMemo(() => {
    const rangeStart = cells[0];
    const last = cells[cells.length - 1];
    const rangeEnd = new Date(last);
    rangeEnd.setHours(23, 59, 59, 999);
    return expandAll(events, rangeStart, rangeEnd);
  }, [events, cells]);

  const byDay = useMemo(
    () => groupOccurrencesByDay(cells, occurrences),
    [cells, occurrences],
  );

  const today = new Date();

  return (
    <div className={classes.month}>
      <div className={classes.weekhead}>
        {WEEKDAYS.map((d) => (
          <div key={d} className={classes.wd}>{d}</div>
        ))}
      </div>
      <div className={classes.grid}>
        {cells.map((day) => {
          const inMonth = isSameMonth(day, cursor);
          const isToday = isSameDay(day, today);
          const items = byDay.get(dayKey(day)) ?? [];
          const visible = items.slice(0, MAX_PER_CELL);
          const extra = items.length - visible.length;
          return (
            <div
              key={day.toISOString()}
              className={`${classes.cell} ${inMonth ? "" : classes.out} ${isToday ? classes.today : ""}`}
            >
              <div className={classes.daynum}>{day.getDate()}</div>
              <div className={classes.events}>
                {visible.map((occ) => (
                  <EventChip
                    key={`${occ.event.id}-${occ.start.toISOString()}`}
                    occ={occ}
                    persons={persons}
                    onClick={onSelectOccurrence}
                  />
                ))}
                {extra > 0 && (
                  <span className={classes.more}>
                    +{extra} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}