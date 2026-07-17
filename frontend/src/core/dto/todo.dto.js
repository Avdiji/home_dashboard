import { Todo } from "../models/todo";

export class TodoDTO {
  constructor({ id, label, is_done = false, personId, frequency = "none" } = {}) {
    this.id = id;
    this.label = label;
    this.is_done = Boolean(is_done);
    this.personId = personId;
    this.frequency = frequency;
  }

  toModel() {
    return new Todo({
      id: this.id,
      label: this.label,
      isDone: this.is_done,
      personId: this.personId,
      frequency: this.frequency,
    });
  }
}