import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getMode, cycleMode, subscribe } from "../../../core/theme";
import classes from "./clock_card.module.css";

// Full-circle ring gauge. Outer ring fills clockwise with day progress; a bead
// rides its tip. 12 tick marks ring the inside like a watch dial. Time sits
// centered inside the ring.
const R = 84;
const C = 2 * Math.PI * R;
const TICKS = Array.from({ length: 12 }, (_, i) => i);
const GLYPH_R = 6; // mode glyph half-size, drawn inside the knob circle (r=9)

// Crisp vector glyphs (not emoji — emoji render inconsistently across
// platforms/fonts at this size and read as ambiguous blobs) for the 3 modes:
// a rayed sun, a crescent moon, and a sun/moon split circle for Auto — the
// classic "follows the system" icon shape, one color per half so it reads as
// literally half sun / half moon rather than a generic contrast toggle.
function ModeGlyph({ mode }) {
  if (mode === "light") {
    return (
      <g className={classes.sunGlyph}>
        <circle r={GLYPH_R * 0.42} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1={0}
            y1={-GLYPH_R * 0.68}
            x2={0}
            y2={-GLYPH_R}
            transform={`rotate(${deg})`}
          />
        ))}
      </g>
    );
  }
  if (mode === "dark") {
    // Two full circles (outer + an offset inner one), cut out via fill-rule
    // evenodd rather than relying on arc sweep-direction subtraction — that
    // trick is finicky and was rendering as a solid disc instead of a
    // crescent. The inner circle must stay fully INSIDE the outer one
    // (offset + inner <= r) or its far side pokes out past the outer edge
    // and gets filled too, bloating the icon instead of just carving a
    // crescent out of it.
    const r = GLYPH_R;
    const inner = r * 0.75;
    const offset = r * 0.22;
    return (
      <path
        className={classes.moonGlyph}
        fillRule="evenodd"
        d={
          `M ${-r} 0 A ${r} ${r} 0 1 0 ${r} 0 A ${r} ${r} 0 1 0 ${-r} 0 Z ` +
          `M ${offset - inner} 0 A ${inner} ${inner} 0 1 0 ${offset + inner} 0 A ${inner} ${inner} 0 1 0 ${offset - inner} 0 Z`
        }
      />
    );
  }
  // auto — right half sun-colored, left half moon-colored, split down the middle
  return (
    <g>
      <path className={classes.autoSunHalf} d={`M 0 ${-GLYPH_R} A ${GLYPH_R} ${GLYPH_R} 0 0 1 0 ${GLYPH_R} Z`} />
      <path className={classes.autoMoonHalf} d={`M 0 ${-GLYPH_R} A ${GLYPH_R} ${GLYPH_R} 0 0 0 0 ${GLYPH_R} Z`} />
    </g>
  );
}

// The clock doubles as the color-mode toggle: clicking it cycles light →
// dark → auto (core/theme.js). Rather than a separate badge, the mode glyph
// rides INSIDE the day-progress bead itself — the bead already travels the
// ring tracking where "now" sits in the 24h day, so a mode glyph there ties
// the two ideas together instead of bolting on an unrelated icon.
export default function ClockCard({ clock }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState(getMode);
  useEffect(() => subscribe(setMode), []);

  const dayOffset = C * (1 - clock.dayProgress / 100);
  // Day bead: angle from top, sweeping clockwise as the day fills.
  const dayAng = (clock.dayProgress / 100) * Math.PI * 2 - Math.PI / 2;
  const knobX = 100 + R * Math.cos(dayAng);
  const knobY = 100 + R * Math.sin(dayAng);
  const modeLabel = t(`theme.${mode}`);

  return (
    <button
      type="button"
      className={classes.wrap}
      onClick={cycleMode}
      title={modeLabel}
      aria-label={modeLabel}
    >
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
          <circle cx={knobX} cy={knobY} r="9" className={classes.knob} />
          <g transform={`translate(${knobX} ${knobY})`} aria-hidden="true">
            <ModeGlyph mode={mode} />
          </g>
        </svg>
        <div className={classes.center}>
          <div className={classes.time}>
            {clock.time}
            <span className={classes.seconds}>:{clock.seconds}</span>
            {clock.meridiem && <span className={classes.meridiem}>{clock.meridiem}</span>}
          </div>
          <div className={classes.weekday}>{t(clock.weekday)}</div>
        </div>
      </div>
      <div className={classes.date}>{clock.date}</div>
    </button>
  );
}