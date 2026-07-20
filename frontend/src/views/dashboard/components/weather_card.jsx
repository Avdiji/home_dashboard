import { describeWeatherCode } from "../../../core/utils/weather_codes";
import { formatTime24 } from "../../../core/utils/date_utils";
import classes from "./weather_card.module.css";

const fmt = (iso) => (iso ? formatTime24(new Date(iso)) : "—");

export default function WeatherCard({ weather }) {
  const { label, icon } = describeWeatherCode(
    weather.weatherCode,
    weather.isDay,
  );
  const temp =
    weather.temperature == null ? "—" : `${Math.round(weather.temperature)}°`;
  const feels =
    weather.apparentTemperature == null
      ? null
      : `${Math.round(weather.apparentTemperature)}°`;
  const wind =
    weather.windSpeed == null ? null : `${Math.round(weather.windSpeed)} km/h`;
  const humidity =
    weather.humidity == null ? null : `${Math.round(weather.humidity)}%`;

  return (
    <div className={classes.wrap}>
      <div className={classes.main}>
        <span className={classes.icon}>{icon}</span>
        <div className={classes.tempBlock}>
          <span className={classes.temp}>{temp}</span>
          {feels && <span className={classes.feels}>feels {feels}</span>}
        </div>
      </div>
      <div className={classes.label}>{label}</div>
      <div className={classes.conditions}>
        {wind && <span>{wind} wind</span>}
        {humidity && <span>{humidity} humidity</span>}
      </div>
      <div className={classes.sun}>
        <span className={classes.sunItem}>↑ {fmt(weather.sunrise)}</span>
        <span className={classes.sunItem}>↓ {fmt(weather.sunset)}</span>
      </div>
    </div>
  );
}