import { formatTime24 } from "../../../core/utils/date_utils";
import classes from "./event_chip.module.css";

export default function EventChip({ occ, persons, onClick, variant = "month" }) {
  const { event, start } = occ;
  const names = event.personIds
    .map((id) => persons.find((p) => p.id === id)?.name)
    .filter(Boolean);

  const Tag = onClick ? "button" : "div";
  const interactive = Boolean(onClick);

  const handle = interactive
    ? (e) => {
        e.stopPropagation();
        onClick(occ);
      }
    : undefined;

  return (
    <Tag
      type={interactive ? "button" : undefined}
      className={`${classes.chip} ${classes[variant]}`}
      onClick={handle}
      title={event.title}
    >
      {variant !== "day" && <span className={classes.time}>{formatTime24(start)}</span>}
      <span className={classes.label}>{event.title}</span>
      {variant === "month" && event.location && (
        <span className={classes.dot} title={event.location} />
      )}
      {variant === "week" && names.length > 0 && (
        <span className={classes.who}>{names.join(", ")}</span>
      )}
    </Tag>
  );
}