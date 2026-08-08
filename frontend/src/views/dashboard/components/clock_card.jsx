import { SECONDS_PER_MINUTE } from "../../../core/constants";
import classes from "./clock_card.module.css";

// Half-gauge (top semicircle). Arc length = π·R.
const R_OUTER = 84;
const R_INNER = 66;
const C_OUTER = Math.PI * R_OUTER;
const C_INNER = Math.PI * R_INNER;
// Arc path from left basepoint over the top to right basepoint (center 100,100).
const arcPath = (r) => `M ${100 - r} 100 A ${r} ${r} 0 0 1 ${100 + r} 100`;

export default function ClockCard({ clock }) {
  const outerOffset = C_OUTER * (1 - clock.dayProgress / 100);
  const innerOffset = C_INNER * (1 - Number(clock.seconds) / SECONDS_PER_MINUTE);

  return (
    <div className={classes.wrap}>
      <svg viewBox="0 0 200 112" className={classes.gauge}>
        <path d={arcPath(R_OUTER)} className={classes.track} />
        <path
          d={arcPath(R_OUTER)}
          className={classes.fillOuter}
          strokeDasharray={C_OUTER}
          strokeDashoffset={outerOffset}
        />
        <path d={arcPath(R_INNER)} className={classes.trackInner} />
        <path
          d={arcPath(R_INNER)}
          className={classes.fillInner}
          strokeDasharray={C_INNER}
          strokeDashoffset={innerOffset}
        />
      </svg>
      <div className={classes.stack}>
        <div className={classes.time}>{clock.time}</div>
        <div className={classes.weekday}>{clock.weekday}</div>
        <div className={classes.date}>{clock.date}</div>
      </div>
    </div>
  );
}