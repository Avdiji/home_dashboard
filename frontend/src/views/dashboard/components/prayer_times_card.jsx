import { useTranslation } from "react-i18next";
import { MINUTES_PER_HOUR } from "../../../core/constants";
import classes from "./prayer_times_card.module.css";

// Today's prayer times for the weather location (AlAdhan). Content only — the
// tiles row (Fajr · Sunrise · Dhuhr · Asr · Maghrib · Isha) with the next
// prayer highlighted + a live countdown, then a muted Hijri date / calculation
// method line. Without a location it points the user at the weather picker.
export default function PrayerTimesCard({ prayers, hasLocation }) {
  const { t } = useTranslation();

  if (!hasLocation || !prayers) {
    return (
      <div className={classes.empty}>
        {hasLocation ? t("dashboard.loadingPrayerTimes") : t("dashboard.prayerNeedsLocation")}
      </div>
    );
  }

  const { items, nextIn, hijri, method } = prayers;
  const hours = Math.floor(nextIn / MINUTES_PER_HOUR);
  const minutes = nextIn % MINUTES_PER_HOUR;
  const countdown = hours
    ? t("dashboard.inHoursMinutes", { hours, minutes })
    : t("dashboard.inMinutes", { count: minutes });

  return (
    <div className={classes.wrap}>
      <div className={classes.grid}>
        {items.map((p) => (
          <div
            key={p.key}
            className={[classes.tile, p.isNext && classes.next, !p.isPrayer && classes.muted]
              .filter(Boolean)
              .join(" ")}
          >
            <span className={classes.name}>{t(`dashboard.prayer${p.key}`)}</span>
            <span className={classes.time}>{p.time}</span>
            {p.isNext && <span className={classes.countdown}>{countdown}</span>}
          </div>
        ))}
      </div>
      {(hijri || method) && (
        <div className={classes.meta}>
          {[hijri && t("dashboard.hijriDate", hijri), method].filter(Boolean).join(" · ")}
        </div>
      )}
    </div>
  );
}
