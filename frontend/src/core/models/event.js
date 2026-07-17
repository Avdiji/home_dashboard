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
  } = {}) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.location = location;
    this.start = start instanceof Date ? start : new Date(start);
    this.end = end instanceof Date ? end : new Date(end);
    this.personIds = Array.isArray(personIds) ? personIds.slice() : [];
    this.frequency = frequency;
  }
}