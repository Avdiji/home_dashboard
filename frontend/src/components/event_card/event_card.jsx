import classes from "./event_card.module.css";

// Shared event card — used by the calendar day view and the dashboard upcoming
// list so event rendering aligns across features. The card owns the box styling
// (bg, left accent border, radius, hover/focus), the title, optional location +
// description, and the member-name pills pinned top-right. The `time` slot is
// caller-provided so each feature renders its own time shape (the calendar shows
// a start–end range; the dashboard shows the start + a relative label).
export default function EventCard({
  as: Tag = "div",
  onClick,
  time,
  title,
  location,
  description,
  names = [],
}) {
  const interactive = Boolean(onClick);
  const activate = interactive ? () => onClick() : undefined;
  const onKeyDown = interactive
    ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      }
    : undefined;

  return (
    <Tag
      className={classes.card}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={activate}
      onKeyDown={onKeyDown}
    >
      {time != null && <div className={classes.time}>{time}</div>}
      <div className={classes.title}>{title}</div>
      {location && <div className={classes.location}>📍 {location}</div>}
      {description && <div className={classes.desc}>{description}</div>}
      {names.length > 0 && (
        <div className={classes.who}>
          {names.map((n) => (
            <span key={n} className={classes.name}>
              {n}
            </span>
          ))}
        </div>
      )}
    </Tag>
  );
}