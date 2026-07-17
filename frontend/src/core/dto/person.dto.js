import { Person } from "../models/person";

export class PersonDTO {
  constructor({ id, name } = {}) {
    this.id = id;
    this.name = name;
  }

  toModel() {
    return new Person({ id: this.id, name: this.name });
  }
}