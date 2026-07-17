import classes from "./calendar_nav.module.css";

export default function CalendarNav({ title, onPrev, onNext, onToday }) {
  return (
    <div className={classes.nav}>
      <div className={classes.controls}>
        <button type="button" className={classes.btn} onClick={onToday}>Today</button>
        <button type="button" className={classes.arrow} onClick={onPrev} aria-label="Previous">‹</button>
        <button type="button" className={classes.arrow} onClick={onNext} aria-label="Next">›</button>
      </div>
      <h1 className={classes.title}>{title}</h1>
      <span />
    </div>
  );
}