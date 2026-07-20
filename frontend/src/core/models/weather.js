export class Weather {
  constructor({
    temperature = null,
    apparentTemperature = null,
    humidity = null,
    weatherCode = null,
    windSpeed = null,
    isDay = true,
    sunrise = null,
    sunset = null,
    hours = [],
  } = {}) {
    this.temperature = temperature;
    this.apparentTemperature = apparentTemperature;
    this.humidity = humidity;
    this.weatherCode = weatherCode;
    this.windSpeed = windSpeed;
    this.isDay = isDay;
    this.sunrise = sunrise;
    this.sunset = sunset;
    this.hours = Array.isArray(hours) ? hours.slice() : [];
  }
}