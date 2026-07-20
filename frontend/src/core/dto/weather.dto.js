import { Weather } from "../models/weather";

// Takes the Open-Meteo `current` payload (snake_case) and coerces to the app
// model shape. Open-Meteo current fields used:
//   temperature_2m, weather_code, wind_speed_10m, is_day
export class WeatherDTO {
  constructor({
    temperature_2m,
    weather_code,
    wind_speed_10m,
    is_day,
  } = {}) {
    this.temperature = temperature_2m;
    this.weatherCode = weather_code;
    this.windSpeed = wind_speed_10m;
    this.isDay = is_day;
  }

  toModel() {
    return new Weather({
      temperature: this.temperature,
      weatherCode: this.weatherCode,
      windSpeed: this.windSpeed,
      isDay: this.isDay,
    });
  }
}