import { describeWeatherCode } from "../../../core/utils/weather_codes";
import classes from "./hourly_strip.module.css";

// Horizontal hourly timeline (next 10 hours; 5 visible at a time, the rest
// scroll). Each cell is a stacked time · icon · temp column; thin vertical
// dividers separate them. Sits along the bottom of the weather tile.
export default function HourlyStrip({ hours }) {
  if (!hours || hours.length === 0) return null;
  return (
    <div className={classes.strip}>
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