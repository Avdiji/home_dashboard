import { PrayerTimes } from "../models/prayer_times";

// Takes the AlAdhan `/v1/timings` payload's `data` object and coerces it to the
// app model shape. AlAdhan fields used:
//   timings:      { Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha, ... } as "HH:MM"
//                 (location-local wall-clock; may carry a " (TZ)" suffix)
//   date.hijri:   day, year, month.en
//   meta.method:  name (the calculation authority AlAdhan picked)
// `day` ("YYYY-MM-DD", the location-local day the times are for) is passed
// by the caller — AlAdhan's own gregorian date is "DD-MM-YYYY".
export class PrayerTimesDTO {
  constructor({ timings = {}, date: dateInfo = {}, meta = {}, day = null } = {}) {
    this.timings = Object.fromEntries(
      Object.entries(timings).map(([k, v]) => [k, String(v).slice(0, 5)]),
    );
    const hijri = dateInfo.hijri ?? {};
    this.hijri = hijri.day
      ? { day: Number(hijri.day), month: hijri.month?.en ?? "", year: Number(hijri.year) }
      : null;
    this.method = meta.method?.name ?? null;
    this.date = day;
  }

  toModel() {
    return new PrayerTimes({
      date: this.date,
      timings: this.timings,
      hijri: this.hijri,
      method: this.method,
    });
  }
}
