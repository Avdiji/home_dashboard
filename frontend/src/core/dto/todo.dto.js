import { Todo } from "../models/todo";

export class TodoDTO {
  constructor({ id, label, is_done = false, personIds = [] } = {}) {
    this.id = id;
    this.label = label;
    this.is_done = Boolean(is_done);
    this.personIds = Array.isArray(personIds) ? personIds.slice() : [];
  }

  toModel() {
    return new Todo({
      id: this.id,
      label: this.label,
      isDone: this.is_done,
      personIds: this.personIds,
    });
  }
}