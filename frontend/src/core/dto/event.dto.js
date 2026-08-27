import { Event } from "../models/event";

// One-way DTO -> Model. Backend mapping written later.
export class EventDTO {
  constructor({
    id,
    title,
    description = "",
    location = "",
    start_at,
    end_at,
    person_ids = [],
    frequency = "none",
    interval = 1,
    exclusions = [],
    is_birthday = false,
  } = {}) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.location = location;
    this.start_at = start_at;
    this.end_at = end_at;
    this.person_ids = Array.isArray(person_ids) ? person_ids.slice() : [];
    this.frequency = frequency;
    this.interval = interval;
    this.exclusions = Array.isArray(exclusions) ? exclusions.slice() : [];
    this.is_birthday = is_birthday;
  }

  toModel() {
    return new Event({
      id: this.id,
      title: this.title,
      description: this.description,
      location: this.location,
      start: this.start_at,
      end: this.end_at,
      personIds: this.person_ids,
      frequency: this.frequency,
      interval: this.interval,
      exclusions: this.exclusions,
      isBirthday: this.is_birthday,
    });
  }
}