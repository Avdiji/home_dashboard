import { describeWeatherCode } from "../../../core/utils/weather_codes";
import { formatTime24 } from "../../../core/utils/date_utils";
import classes from "./hourly_strip.module.css";

export default function HourlyStrip({ hours }) {
  if (!hours || hours.length === 0) return null;
  return (
    <div className={classes.strip}>
      {hours.map((h) => {
        const { icon } = describeWeatherCode(h.weatherCode);
        const label = formatTime24(new Date(h.time));
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