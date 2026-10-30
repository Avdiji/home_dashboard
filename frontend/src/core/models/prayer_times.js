export class PrayerTimes {
  constructor({ date = null, timings = {}, hijri = null, method = null } = {}) {
    // Location-local day ("YYYY-MM-DD") the timings belong to.
    this.date = date;
    // { Fajr: "HH:MM", Sunrise, Dhuhr, Asr, Maghrib, Isha, ... } — location-local
    // wall-clock strings (no offset).
    this.timings = { ...timings };
    // { day, month, year } or null.
    this.hijri = hijri ? { ...hijri } : null;
    // Calculation authority name (e.g. "Muslim World League") or null.
    this.method = method;
  }
}
