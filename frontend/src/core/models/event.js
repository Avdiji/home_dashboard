export class Event {
  constructor({
    id,
    title,
    description = "",
    location = "",
    start,
    end,
    personIds = [],
    frequency = "none",
    interval = 1,
    exclusions = [],
  } = {}) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.location = location;
    this.start = start instanceof Date ? start : new Date(start);
    this.end = end instanceof Date ? end : new Date(end);
    this.personIds = Array.isArray(personIds) ? personIds.slice() : [];
    this.frequency = frequency;
    this.interval = interval || 1;
    this.exclusions = Array.isArray(exclusions) ? exclusions.slice() : [];
  }
}