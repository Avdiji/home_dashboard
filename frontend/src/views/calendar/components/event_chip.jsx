import { useTranslation } from "react-i18next";
import { formatTime24 } from "../../../core/utils/date_utils";
import { eventDisplayTitle } from "../../../core/utils/event_display";
import classes from "./event_chip.module.css";

export default function EventChip({ occ, persons, onClick, variant = "month" }) {
  const { t } = useTranslation();
  const { event, start } = occ;
  const names = event.personIds
    .map((id) => persons.find((p) => p.id === id)?.name)
    .filter(Boolean);
  const title = eventDisplayTitle(event, persons, t);

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
      title={title}
    >
      {variant !== "day" && <span className={classes.time}>{formatTime24(start)}</span>}
      <span className={classes.label}>{title}</span>
      {variant === "month" && event.location && (
        <span className={classes.dot} title={event.location} />
      )}
      {variant === "week" && names.length > 0 && (
        <span className={classes.who}>{names.join(", ")}</span>
      )}
    </Tag>
  );
}