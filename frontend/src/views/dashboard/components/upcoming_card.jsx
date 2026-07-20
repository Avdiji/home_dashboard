import { formatTime24 } from "../../../core/utils/date_utils";
import EventCard from "../../../components/event_card/event_card";
import classes from "./upcoming_card.module.css";

const relative = (start, now) => {
  const mins = (start.getTime() - now.getTime()) / 60000;
  if (mins <= 0) return "now";
  if (mins < 60) return `in ${Math.max(1, Math.round(mins))}m`;
  const hours = mins / 60;
  if (hours < 24) return `in ${Math.round(hours)}h`;
  const days = hours / 24;
  if (days < 2) return "tomorrow";
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