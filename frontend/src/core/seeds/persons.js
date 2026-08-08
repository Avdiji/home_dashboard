import { PersonDTO } from "../dto/person.dto";

// Shared family roster — cross-feature reference data used by every feature
// that assigns members (calendar events, checklists, …). Lives here, not in a
// feature hook, because the same members back every feature. When the backend
// lands this becomes a fetch consumed by each hook.
export const SEED_PERSONS = [
  new PersonDTO({ id: 1, name: "Anna", birthday: "1992-08-12" }).toModel(),
  new PersonDTO({ id: 2, name: "Mark", birthday: "1988-04-23" }).toModel(),
  new PersonDTO({ id: 3, name: "Lena", birthday: "1998-07-25" }).toModel(),
];