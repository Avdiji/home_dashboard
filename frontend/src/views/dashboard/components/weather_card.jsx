import Card from "../../../components/cards/card";
import { describeWeatherCode } from "../../../core/utils/weather_codes";
import classes from "./weather_card.module.css";

export default function WeatherCard({ weather }) {
  const { label, icon } = describeWeatherCode(weather.weatherCode);
  const temp =
    weather.temperature == null ? "—" : `${Math.round(weather.temperature)}°C`;
  const wind =
    weather.windSpeed == null ? null : `${Math.round(weather.windSpeed)} km/h`;

  return (
    <Card title="Weather">
      <div className={classes.row}>
        <span className={classes.icon}>{icon}</span>
        <span className={classes.temp}>{temp}</span>
      </div>
      <div className={classes.label}>{label}</div>
      {wind && <div className={classes.wind}>{wind} wind</div>}
    </Card>
  );
}