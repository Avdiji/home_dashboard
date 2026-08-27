// Calendar view modes as enum-like Symbols (not raw strings).
export const VIEW_DAY = Symbol("day");
export const VIEW_WEEK = Symbol("week");
export const VIEW_MONTH = Symbol("month");

export const VIEWS = Object.freeze([
  { value: VIEW_DAY, key: "day", labelKey: "calendar.viewDay" },
  { value: VIEW_WEEK, key: "week", labelKey: "calendar.viewWeek" },
  { value: VIEW_MONTH, key: "month", labelKey: "calendar.viewMonth" },
]);