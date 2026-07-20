export class Weather {
  constructor({ temperature = null, weatherCode = null, windSpeed = null, isDay = true } = {}) {
    this.temperature = temperature;
    this.weatherCode = weatherCode;
    this.windSpeed = windSpeed;
    this.isDay = isDay;
  }
}