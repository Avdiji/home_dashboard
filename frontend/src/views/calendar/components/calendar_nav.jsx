import { useTranslation } from "react-i18next";
import classes from "./calendar_nav.module.css";

export default function CalendarNav({ title, onPrev, onNext, onToday }) {
  const { t } = useTranslation();
  return (
    <div className={classes.nav}>
      <div className={classes.controls}>
        <button type="button" className={classes.btn} onClick={onToday}>{t("calendar.today")}</button>
        <button type="button" className={classes.arrow} onClick={onPrev} aria-label={t("calendar.prev")}>‹</button>
        <button type="button" className={classes.arrow} onClick={onNext} aria-label={t("calendar.next")}>›</button>
      </div>
      <h1 className={classes.title}>{title}</h1>
      <span />
    </div>
  );
}