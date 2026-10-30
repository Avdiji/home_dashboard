import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { getMode, cycleMode, subscribe } from "../../../core/theme";
import { MINUTES_PER_HOUR, HOURS_PER_DAY } from "../../../core/constants";
import classes from "./clock_card.module.css";

// Full-circle ring gauge. Outer ring fills clockwise with day progress; a bead
// rides its tip. 12 tick marks ring the inside like a watch dial. Time sits
// centered inside the ring.
const R = 84;
const C = 2 * Math.PI * R;
const TICKS = Array.from({ length: 12 }, (_, i) => i);
const GLYPH_R = 6; // mode glyph half-size, drawn inside the knob circle (r=9)

// Prayer orbit — a second, dotted ring outside the day ring where each prayer
// sits at its time of day (same 24h mapping as the day arc: midnight at the
// top, clockwise). A lavender trail runs from the last prayer to now, marching
// dashes from now to the next prayer; the next prayer's dot ripples. With
// prayers the viewBox widens to fit the labels around the orbit.
const CX = 100;
const CY = 100;
const ORBIT_R = 104;
const LABEL_R = 121;
const CHIP_PAD_X = 7;
const CHIP_PAD_Y = 3;
const MINUTES_PER_DAY = MINUTES_PER_HOUR * HOURS_PER_DAY;
const dayAngle = (min) => (min / MINUTES_PER_DAY) * 360 - 90;
const polar = (r, deg) => [
  CX + r * Math.cos((deg * Math.PI) / 180),
  CY + r * Math.sin((deg * Math.PI) / 180),
];

// Clockwise arc from a0 to a1 (degrees); wraps past midnight when a1 < a0.
function arcPath(r, a0, a1) {
  let end = a1;
  while (end < a0) end += 360;
  const [x0, y0] = polar(r, a0);
  const [x1, y1] = polar(r, end);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${end - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}

// Labels hug the orbit: left side anchors at its end, right side at its start.
function labelAnchor(deg) {
  const c = Math.cos((deg * Math.PI) / 180);
  if (c > 0.35) return "start";
  if (c < -0.35) return "end";
  return "middle";
}

function buildOrbit(items, nowMin) {
  const next = items.find((p) => p.isNext);
  const passed = items.filter((p) => p.isPrayer && p.minutes <= nowMin);
  // Before Fajr the last prayer was yesterday's Isha.
  const prev = passed.length ? passed[passed.length - 1] : items.filter((p) => p.isPrayer).pop();
  const nowAng = dayAngle(nowMin);
  return {
    elapsed: prev ? arcPath(ORBIT_R, dayAngle(prev.minutes), nowAng) : null,
    flow: next ? arcPath(ORBIT_R, nowAng, dayAngle(next.minutes)) : null,
    marks: items.map((p) => {
      const ang = dayAngle(p.minutes);
      const [x, y] = polar(ORBIT_R, ang);
      // Top/bottom labels sit centered on the dot's axis — nudge them out so
      // the next-prayer ripple doesn't run into the text.
      const anchor = labelAnchor(ang);
      // The next prayer's label sits on a chip, so it gets a little more room.
      const r = LABEL_R + (anchor === "middle" ? 6 : 0) + (p.isNext ? 5 : 0);
      const [lx, ly] = polar(r, ang);
      const state = p.isNext ? "next" : !p.isPrayer ? "aux" : p.minutes <= nowMin ? "past" : "future";
      return { ...p, x, y, lx, ly, anchor, state };
    }),
  };
}

// The next prayer's label on a solid accent chip — the chip is sized from the
// rendered text's bounding box (SVG text has no intrinsic background).
function NextLabel({ x, y, anchor, className, children }) {
  const ref = useRef(null);
  const [box, setBox] = useState(null);
  useLayoutEffect(() => {
    const b = ref.current?.getBBox();
    if (!b) return;
    setBox((prev) =>
      prev && prev.x === b.x && prev.y === b.y && prev.width === b.width && prev.height === b.height
        ? prev
        : { x: b.x, y: b.y, width: b.width, height: b.height }
    );
  }, [x, y, anchor, children]);
  return (
    <g>
      {box && (
        <rect
          x={box.x - CHIP_PAD_X}
          y={box.y - CHIP_PAD_Y}
          width={box.width + CHIP_PAD_X * 2}
          height={box.height + CHIP_PAD_Y * 2}
          rx={(box.height + CHIP_PAD_Y * 2) / 2}
          className={classes.nextChip}
        />
      )}
      <text ref={ref} x={x} y={y} textAnchor={anchor} className={className}>
        {children}
      </text>
    </g>
  );
}

const DOT_CLASS = { next: "dotNext", aux: "dotAux", past: "dotPast", future: "dotFuture" };
const LABEL_CLASS = { next: "labelNext", aux: "labelAux", past: "labelPast", future: "" };

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
export default function ClockCard({ clock, prayers }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState(getMode);
  useEffect(() => subscribe(setMode), []);

  const dayOffset = C * (1 - clock.dayProgress / 100);
  // Day bead: angle from top, sweeping clockwise as the day fills.
  const dayAng = (clock.dayProgress / 100) * Math.PI * 2 - Math.PI / 2;
  const knobX = 100 + R * Math.cos(dayAng);
  const knobY = 100 + R * Math.sin(dayAng);
  const modeLabel = t(`theme.${mode}`);

  const items = prayers?.items?.every((p) => Number.isFinite(p.minutes)) ? prayers.items : null;
  const orbit = items ? buildOrbit(items, (clock.dayProgress / 100) * MINUTES_PER_DAY) : null;
  const nextPrayer = items?.find((p) => p.isNext);
  let countdown = null;
  if (nextPrayer && prayers.nextIn != null) {
    const hours = Math.floor(prayers.nextIn / MINUTES_PER_HOUR);
    const minutes = prayers.nextIn % MINUTES_PER_HOUR;
    countdown = hours
      ? t("dashboard.inHoursMinutes", { hours, minutes })
      : t("dashboard.inMinutes", { count: minutes });
  }

  return (
    <button
      type="button"
      className={classes.wrap}
      onClick={cycleMode}
      title={modeLabel}
      aria-label={modeLabel}
    >
      <div className={orbit ? `${classes.ring} ${classes.orbitRing}` : classes.ring}>
        <svg viewBox={orbit ? "-100 -50 400 300" : "0 0 200 200"} className={classes.gauge}>
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
          {orbit && (
            <g aria-hidden="true">
              <circle cx={CX} cy={CY} r={ORBIT_R} className={classes.guide} />
              {orbit.elapsed && <path d={orbit.elapsed} className={classes.elapsed} />}
              {orbit.flow && <path d={orbit.flow} className={classes.flow} />}
              {orbit.marks.map((p) => (
                <g key={p.key}>
                  {p.state === "next" && (
                    <>
                      <circle cx={p.x} cy={p.y} r="6" className={classes.ripple} />
                      <circle cx={p.x} cy={p.y} r="6" className={`${classes.ripple} ${classes.rippleLate}`} />
                    </>
                  )}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={p.state === "next" ? 6.5 : p.isPrayer ? 4 : 3.5}
                    className={classes[DOT_CLASS[p.state]]}
                  />
                  {p.state === "next" ? (
                    <NextLabel x={p.lx} y={p.ly} anchor={p.anchor} className={`${classes.label} ${classes.labelNext}`}>
                      <tspan className={classes.labelName}>{t(`dashboard.prayer${p.key}`)}</tspan>{" "}
                      <tspan className={classes.labelTime}>{p.time}</tspan>
                    </NextLabel>
                  ) : (
                    <text
                      x={p.lx}
                      y={p.ly}
                      textAnchor={p.anchor}
                      className={[classes.label, classes[LABEL_CLASS[p.state]]].filter(Boolean).join(" ")}
                    >
                      <tspan className={classes.labelName}>{t(`dashboard.prayer${p.key}`)}</tspan>{" "}
                      <tspan className={classes.labelTime}>{p.time}</tspan>
                    </text>
                  )}
                </g>
              ))}
            </g>
          )}
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
      {nextPrayer && (
        <span className={classes.nextPill}>
          {t(`dashboard.prayer${nextPrayer.key}`)} {nextPrayer.time}
          {countdown && <span className={classes.nextIn}> · {countdown}</span>}
        </span>
      )}
      <div className={classes.date}>{clock.date}</div>
    </button>
  );
}