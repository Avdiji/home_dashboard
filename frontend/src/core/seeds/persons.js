import { PersonDTO } from "../dto/person.dto";

// Shared family roster — cross-feature reference data used by every feature
// that assigns members (calendar events, checklists, …). Lives here, not in a
// feature hook, because the same members back every feature. When the backend
// lands this becomes a fetch consumed by each hook.
export const SEED_PERSONS = [
  new PersonDTO({ id: 1, name: "Anna" }).toModel(),
  new PersonDTO({ id: 2, name: "Mark" }).toModel(),
  new PersonDTO({ id: 3, name: "Lena" }).toModel(),
];