import { useMemo } from "react";
import {
  isSameDay,
  startOfDay,
  endOfDay,
  formatTime24,
} from "../../../core/utils/date_utils";
import { expandAll } from "../../../core/utils/recurrence";
import EventCard from "../../../components/event_card/event_card";
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
            <EventCard
              key={`${event.id}-${start.toISOString()}`}
              as="li"
              onClick={() => onSelectOccurrence(occ)}
              time={`${formatTime24(start)} – ${formatTime24(end)}`}
              title={event.title}
              location={event.location}
              description={event.description}
              names={names}
            />
          );
        })}
      </ul>
    </div>
  );
}