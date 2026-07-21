export class Person {
  constructor({ id, name, birthday = null } = {}) {
    this.id = id;
    this.name = name;
    // ISO "YYYY-MM-DD" (date-only), or null when unset. Date-only so the day
    // doesn't shift with timezone when parsed as local.
    this.birthday = birthday;
  }
}