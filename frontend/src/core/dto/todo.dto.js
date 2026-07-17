import { Todo } from "../models/todo";

export class TodoDTO {
  constructor({ id, label, is_done = false, personIds = [], frequency = "none" } = {}) {
    this.id = id;
    this.label = label;
    this.is_done = Boolean(is_done);
    this.personIds = Array.isArray(personIds) ? personIds.slice() : [];
    this.frequency = frequency;
  }

  toModel() {
    return new Todo({
      id: this.id,
      label: this.label,
      isDone: this.is_done,
      personIds: this.personIds,
      frequency: this.frequency,
    });
  }
}