import classes from "./clock_card.module.css";

// Full-circle ring gauge. Outer ring fills clockwise with day progress; a bead
// rides its tip. 12 tick marks ring the inside like a watch dial. Time sits
// centered inside the ring.
const R = 84;
const C = 2 * Math.PI * R;
const TICKS = Array.from({ length: 12 }, (_, i) => i);

export default function ClockCard({ clock }) {
  const dayOffset = C * (1 - clock.dayProgress / 100);
  // Day bead: angle from top, sweeping clockwise as the day fills.
  const dayAng = (clock.dayProgress / 100) * Math.PI * 2 - Math.PI / 2;
  const knobX = 100 + R * Math.cos(dayAng);
  const knobY = 100 + R * Math.sin(dayAng);

  return (
    <div className={classes.wrap}>
      <div className={classes.ring}>
        <svg viewBox="0 0 200 200" className={classes.gauge}>
          <defs>
            <linearGradient id="clockRing" x1="0" y1="0" x2="1" y2="1">
              <stop className={classes.gradA} offset="0%" />
              <stop className={classes.gradB} offset="100%" />
            </linearGradient>
          </defs>
          {TICKS.map((i) => {
            const ang = (i * 30 - 90) * (Math.PI / 180);
            const major = i % 3 === 0;
            const r1 = major ? 71 : 73;
            const r2 = 80;
            return (
              <line
                key={i}
                x1={100 + r1 * Math.cos(ang)}
                y1={100 + r1 * Math.sin(ang)}
                x2={100 + r2 * Math.cos(ang)}
                y2={100 + r2 * Math.sin(ang)}
                className={major ? classes.tickMajor : classes.tick}
              />
            );
          })}
          <circle cx="100" cy="100" r={R} className={classes.track} />
          <circle
            cx="100"
            cy="100"
            r={R}
            className={classes.fill}
            stroke="url(#clockRing)"
            strokeWidth="8"
            strokeDasharray={C}
            strokeDashoffset={dayOffset}
            transform="rotate(-90 100 100)"
          />
          <circle cx={knobX} cy={knobY} r="5.5" className={classes.knob} />
        </svg>
        <div className={classes.center}>
          <div className={classes.time}>
            {clock.time}
            <span className={classes.seconds}>:{clock.seconds}</span>
          </div>
          <div className={classes.weekday}>{clock.weekday}</div>
        </div>
      </div>
      <div className={classes.date}>{clock.date}</div>
    </div>
  );
}