import { useTranslation } from "react-i18next";
import { formatTime24 } from "../../../core/utils/date_utils";
import {
  MS_PER_MINUTE,
  MINUTES_PER_HOUR,
  HOURS_PER_DAY,
  TOMORROW_THRESHOLD_DAYS,
} from "../../../core/constants";
import EventCard from "../../../components/event_card/event_card";
import classes from "./upcoming_card.module.css";

// Relative-time label for an upcoming event. Never says "tomorrow" — the
// former "tomorrow" zone (next 48h) now renders as hours so the card always
// tells how many hours away the event is. Beyond that, days. Returns an i18n
// key + count so the render site translates it.
const relativeKey = (start, now) => {
  const mins = (start.getTime() - now.getTime()) / MS_PER_MINUTE;
  if (mins <= 0) return { key: "dashboard.now" };
  if (mins < MINUTES_PER_HOUR) return { key: "dashboard.inMinutes", count: Math.max(1, Math.round(mins)) };
  const hours = mins / MINUTES_PER_HOUR;
  if (hours < TOMORROW_THRESHOLD_DAYS * HOURS_PER_DAY)
    return { key: "dashboard.inHours", count: Math.round(hours) };
  const days = hours / HOURS_PER_DAY;
  return { key: "dashboard.inDays", count: Math.round(days) };
};

export default function UpcomingCard({ now, events, onEventClick }) {
  const { t } = useTranslation();
  if (events.length === 0) {
    return <div className={classes.empty}>{t("dashboard.nothingOnHorizon")}</div>;
  }
  return (
    <ul className={classes.list}>
      {events.map((e) => {
        const rel = relativeKey(e.start, now);
        return (
          <EventCard
            key={e.id}
            as="li"
            onClick={onEventClick ? () => onEventClick(e.id, e.start) : undefined}
            time={
              <>
                {formatTime24(e.start)}{" "}
                <span className={classes.rel}>
                  {rel.count != null ? t(rel.key, { count: rel.count }) : t(rel.key)}
                </span>
              </>
            }
            title={e.title}
            location={e.location}
            names={e.persons.map((p) => p.name)}
          />
        );
      })}
    </ul>
  );
}