export class Todo {
  constructor({ id, label, isDone = false, personId, frequency = "none" } = {}) {
    this.id = id;
    this.label = label;
    this.isDone = Boolean(isDone);
    this.personId = personId;
    this.frequency = frequency;
  }
}