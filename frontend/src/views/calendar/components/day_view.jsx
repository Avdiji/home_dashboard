import { useMemo } from "react";
import {
  isSameDay,
  startOfDay,
  endOfDay,
  formatTime,
} from "../../../core/utils/date_utils";
import { expandAll } from "../recurrence";
import EventChip from "./event_chip";
import classes from "./day_view.module.css";

export default function DayView({ cursor, events, persons, onSelectOccurrence }) {
  const rangeStart = startOfDay(cursor);
  const rangeEnd = endOfDay(cursor);

  const occurrences = useMemo(
    () => expandAll(events, rangeStart, rangeEnd),
    [events, rangeStart, rangeEnd],
  );

  const today = new Date();
  const isToday = isSameDay(cursor, today);

  return (
    <div className={isToday ? `${classes.day} ${classes.today}` : classes.day}>
      {isToday && <div className={classes.today_badge}>Today</div>}
      {occurrences.length === 0 && (
        <div className={classes.empty}>No events today.</div>
      )}
      <ul className={classes.list}>
        {occurrences.map((occ) => {
          const { event, start, end } = occ;
          const names = event.personIds
            .map((id) => persons.find((p) => p.id === id)?.name)
            .filter(Boolean);
          return (
            <li
              key={`${event.id}-${start.toISOString()}`}
              className={classes.card}
              role="button"
              tabIndex={0}
              onClick={() => onSelectOccurrence(occ)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectOccurrence(occ);
                }
              }}
            >
              <div className={classes.time}>
                {formatTime(start)} – {formatTime(end)}
              </div>
              <EventChip occ={occ} persons={persons} variant="day" />
              {event.location && (
                <div className={classes.location}>📍 {event.location}</div>
              )}
              {event.description && (
                <div className={classes.desc}>{event.description}</div>
              )}
              {names.length > 0 && (
                <div className={classes.who}>
                  {names.map((n) => (
                    <span key={n} className={classes.name_chip}>{n}</span>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}