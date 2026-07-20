import { formatTime24 } from "../../../core/utils/date_utils";
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

const initials = (name) => (name?.trim()?.[0] ?? "?").toUpperCase();

export default function UpcomingCard({ now, events, onEventClick }) {
  if (events.length === 0) {
    return <div className={classes.empty}>Nothing on the horizon</div>;
  }
  return (
    <ul className={classes.list}>
      {events.map((e) => (
        <li
          key={e.id}
          className={classes.row}
          onClick={onEventClick ? () => onEventClick(e.id) : undefined}
          role={onEventClick ? "button" : undefined}
          tabIndex={onEventClick ? 0 : undefined}
          onKeyDown={
            onEventClick
              ? (ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    onEventClick(e.id);
                  }
                }
              : undefined
          }
        >
          <div className={classes.timeCol}>
            <span className={classes.time}>{formatTime24(e.start)}</span>
            <span className={classes.rel}>{relative(e.start, now)}</span>
          </div>
          <div className={classes.body}>
            <div className={classes.title}>{e.title}</div>
            {e.persons.length > 0 && (
              <div className={classes.chips}>
                {e.persons.map((p) => (
                  <span key={p.id} className={classes.chip}>
                    {initials(p.name)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}