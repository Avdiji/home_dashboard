export class Todo {
  constructor({ id, label, isDone = false, personIds = [] } = {}) {
    this.id = id;
    this.label = label;
    this.isDone = Boolean(isDone);
    this.personIds = Array.isArray(personIds) ? personIds.slice() : [];
  }
}