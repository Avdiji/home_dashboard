import { Person } from "../models/person";

export class PersonDTO {
  constructor({ id, name, birthday = null } = {}) {
    this.id = id;
    this.name = name;
    // snake_case backend shape; birthday is already ISO "YYYY-MM-DD".
    this.birthday = birthday;
  }

  toModel() {
    return new Person({ id: this.id, name: this.name, birthday: this.birthday });
  }
}