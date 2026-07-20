import classes from "./clock_card.module.css";

const R_OUTER = 90;
const R_INNER = 72;
const C_OUTER = 2 * Math.PI * R_OUTER;
const C_INNER = 2 * Math.PI * R_INNER;

export default function ClockCard({ clock }) {
  const outerOffset = C_OUTER * (1 - clock.dayProgress / 100);
  const innerOffset = C_INNER * (1 - Number(clock.seconds) / 60);

  return (
    <div className={classes.wrap}>
      <div className={classes.clock}>
        <svg viewBox="0 0 200 200" className={classes.ring}>
          <circle cx="100" cy="100" r={R_OUTER} className={classes.track} />
          <circle
            cx="100"
            cy="100"
            r={R_OUTER}
            className={classes.fillOuter}
            strokeDasharray={C_OUTER}
            strokeDashoffset={outerOffset}
            transform="rotate(-90 100 100)"
          />
          <circle cx="100" cy="100" r={R_INNER} className={classes.trackInner} />
          <circle
            cx="100"
            cy="100"
            r={R_INNER}
            className={classes.fillInner}
            strokeDasharray={C_INNER}
            strokeDashoffset={innerOffset}
            transform="rotate(-90 100 100)"
          />
        </svg>
        <div className={classes.center}>
          <div className={classes.time}>{clock.time}</div>
          <div className={classes.weekday}>{clock.weekday}</div>
          <div className={classes.date}>{clock.date}</div>
        </div>
      </div>
    </div>
  );
}