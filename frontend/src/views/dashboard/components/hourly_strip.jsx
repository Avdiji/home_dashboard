import { useRef, useState } from "react";
import { describeWeatherCode } from "../../../core/utils/weather_codes";
import classes from "./hourly_strip.module.css";

// Horizontal hourly timeline (next 10 hours; 5 visible at a time, the rest
// scroll). Each cell is a stacked time · icon · temp column; thin vertical
// dividers separate them. Sits along the bottom of the weather tile.
export default function HourlyStrip({ hours }) {
  const stripRef = useRef(null);
  // Mutable per-drag values live in a ref (mousemove fires far too often to
  // route through setState); `dragging` alone is state, just to toggle the
  // grab/grabbing cursor class.
  const dragRef = useRef({ dragging: false, startX: 0, startScrollLeft: 0 });
  const [dragging, setDragging] = useState(false);

  // A touch swipe scrolls the strip natively, but this dashboard targets
  // mouse-only kiosk hardware (Raspberry Pi + monitor, no trackpad/wheel) —
  // so a left-mouse-button drag has to work too.
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    dragRef.current = {
      dragging: true,
      startX: e.pageX,
      startScrollLeft: stripRef.current.scrollLeft,
    };
    setDragging(true);
  };

  const handleMouseMove = (e) => {
    const drag = dragRef.current;
    if (!drag.dragging) return;
    e.preventDefault();
    stripRef.current.scrollLeft = drag.startScrollLeft - (e.pageX - drag.startX);
  };

  const endDrag = () => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    setDragging(false);
  };

  // A mouse with a wheel still gets the usual vertical-delta-to-horizontal
  // redirect as a bonus, alongside the drag.
  const handleWheel = (e) => {
    if (e.deltaY === 0) return;
    e.currentTarget.scrollLeft += e.deltaY;
  };

  if (!hours || hours.length === 0) return null;

  return (
    <div
      ref={stripRef}
      className={dragging ? `${classes.strip} ${classes.dragging}` : classes.strip}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
    >
      {hours.map((h) => {
        const { icon } = describeWeatherCode(h.weatherCode, h.isDay);
        // h.time is a local wall-clock string for the queried location (no
        // offset) — read "HH:MM" straight out of it rather than routing it
        // through `new Date()`, which would parse it in the browser's own
        // timezone and show the wrong hour for a location elsewhere.
        const label = h.time.split("T")[1]?.slice(0, 5) ?? "";
        return (
          <div key={h.time} className={classes.cell}>
            <span className={classes.hour}>{label}</span>
            <span className={classes.icon}>{icon}</span>
            <span className={classes.temp}>
              {h.temperature == null ? "—" : `${Math.round(h.temperature)}°`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
