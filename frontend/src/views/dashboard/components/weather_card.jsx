import { useTranslation } from "react-i18next";
import { describeWeatherCode } from "../../../core/utils/weather_codes";
import { formatTime24 } from "../../../core/utils/date_utils";
import HourlyStrip from "./hourly_strip";
import classes from "./weather_card.module.css";

const fmt = (iso) => (iso ? formatTime24(new Date(iso)) : "—");

// The weather tile. Header carries the place + a "Change" action; the body is a
// large icon badge beside the temperature + condition; a row of condition chips
// (wind / humidity / sun); the hourly timeline is pinned to the bottom.
export default function WeatherCard({ weather, place, hours, onChangeLocation }) {
  const { t } = useTranslation();
  const { labelKey, icon } = describeWeatherCode(
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
      <div className={classes.head}>
        <div className={classes.place}>📍 {place}</div>
        <button
          type="button"
          className={classes.changeLoc}
          onClick={onChangeLocation}
        >
          {t("dashboard.change")}
        </button>
      </div>

      <div className={classes.main}>
        <div className={classes.iconBadge}>{icon}</div>
        <div className={classes.tempBlock}>
          <span className={classes.temp}>{temp}</span>
          <span className={classes.cond}>{t(labelKey)}</span>
          {feels && <span className={classes.feels}>{t("dashboard.feels", { feels })}</span>}
        </div>
      </div>

      <div className={classes.chips}>
        {wind && <span className={classes.chip}>{t("dashboard.windChip", { wind })}</span>}
        {humidity && <span className={classes.chip}>{t("dashboard.humidityChip", { humidity })}</span>}
        <span className={classes.chip}>{t("dashboard.sunChip", { sunrise: fmt(weather.sunrise), sunset: fmt(weather.sunset) })}</span>
      </div>

      <div className={classes.forecast}>
        <HourlyStrip hours={hours} />
      </div>
    </div>
  );
}