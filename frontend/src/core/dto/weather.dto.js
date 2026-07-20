import { Weather } from "../models/weather";

// Takes the Open-Meteo payload (snake_case) and coerces to the app model shape.
// Open-Meteo fields used:
//   current: temperature_2m, apparent_temperature, relative_humidity_2m,
//            weather_code, wind_speed_10m, is_day
//   daily:   sunrise[0], sunset[0] (first/only day)
// `sunrise`/`sunset` are pre-extracted by the caller (the hook pulls them out
// of `daily` and passes them alongside `current`). `hours` is a pre-extracted
// array of `{ time, temperature, weatherCode }` for the hourly forecast strip.
export class WeatherDTO {
  constructor({
    temperature_2m,
    apparent_temperature,
    relative_humidity_2m,
    weather_code,
    wind_speed_10m,
    is_day,
    sunrise,
    sunset,
    hours = [],
  } = {}) {
    this.temperature = temperature_2m;
    this.apparentTemperature = apparent_temperature;
    this.humidity = relative_humidity_2m;
    this.weatherCode = weather_code;
    this.windSpeed = wind_speed_10m;
    this.isDay = is_day;
    this.sunrise = sunrise;
    this.sunset = sunset;
    this.hours = Array.isArray(hours) ? hours.slice() : [];
  }

  toModel() {
    return new Weather({
      temperature: this.temperature,
      apparentTemperature: this.apparentTemperature,
      humidity: this.humidity,
      weatherCode: this.weatherCode,
      windSpeed: this.windSpeed,
      isDay: this.isDay,
      sunrise: this.sunrise,
      sunset: this.sunset,
      hours: this.hours,
    });
  }
}