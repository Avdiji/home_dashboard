// Calendar view modes as enum-like Symbols (not raw strings).
export const VIEW_DAY = Symbol("day");
export const VIEW_WEEK = Symbol("week");
export const VIEW_MONTH = Symbol("month");

export const VIEWS = Object.freeze([
  { value: VIEW_DAY, label: "Day" },
  { value: VIEW_WEEK, label: "Week" },
  { value: VIEW_MONTH, label: "Month" },
]);