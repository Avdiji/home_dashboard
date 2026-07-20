import { formatTime24 } from "../../../core/utils/date_utils";
import {
  MS_PER_MINUTE,
  MINUTES_PER_HOUR,
  HOURS_PER_DAY,
  TOMORROW_THRESHOLD_DAYS,
} from "../../../core/constants";
import EventCard from "../../../components/event_card/event_card";
import classes from "./upcoming_card.module.css";

const relative = (start, now) => {
  const mins = (start.getTime() - now.getTime()) / MS_PER_MINUTE;
  if (mins <= 0) return "now";
  if (mins < MINUTES_PER_HOUR) return `in ${Math.max(1, Math.round(mins))}m`;
  const hours = mins / MINUTES_PER_HOUR;
  if (hours < HOURS_PER_DAY) return `in ${Math.round(hours)}h`;
  const days = hours / HOURS_PER_DAY;
  if (days < TOMORROW_THRESHOLD_DAYS) return "tomorrow";
  return `in ${Math.round(days)}d`;
};

export default function UpcomingCard({ now, events, onEventClick }) {
  if (events.length === 0) {
    return <div className={classes.empty}>Nothing on the horizon</div>;
  }
  return (
    <ul className={classes.list}>
      {events.map((e) => (
        <EventCard
          key={e.id}
          as="li"
          onClick={onEventClick ? () => onEventClick(e.id, e.start) : undefined}
          time={
            <>
              {formatTime24(e.start)}{" "}
              <span className={classes.rel}>{relative(e.start, now)}</span>
            </>
          }
          title={e.title}
          location={e.location}
          names={e.persons.map((p) => p.name)}
        />
      ))}
    </ul>
  );
}