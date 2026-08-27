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
    place = null,
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
    // Place name for the coords the weather was fetched for (e.g. "Berlin, DE").
    // Resolved separately (reverse geocoding / IP geo) by the dashboard hook —
    // not part of the Open-Meteo forecast payload itself.
    this.place = place;
  }
}