import { create } from "zustand";
import { SEED_PERSONS } from "../core/seeds/persons";
import { sendCommand } from "../core/api/transport";

// Centralized persons (family roster) state. Single source of truth shared by
// the dashboard (members section), calendar (event assignee picker), and
// checklist (list assignee picker). Module-level store — no provider needed;
// any component subscribes via `usePersons((s) => s.persons)`.
//
// Seeds still define the initial state (the "all data seeded" rule) so the UI
// renders before the backend hydrates; `loadAll()` swaps them for the fetched
// roster on mount. Mutations fire WS commands (no optimistic local update —
// the broadcast round-trip, delivered to every client including this one, is
// what updates the store via applyEvent). The action signature stays the spec
// for the command payload.

export const usePersons = create(() => ({
  persons: SEED_PERSONS,
  // person.add — backend creates the row, broadcasts person.created
  addPerson: ({ name, birthday }) =>
    sendCommand("person.add", { name, birthday }),
  // person.update — { personId, name, birthday }
  updatePerson: (personId, { name, birthday }) =>
    sendCommand("person.update", { personId, name, birthday }),
  // person.delete — { personId }
  removePerson: (personId) =>
    sendCommand("person.delete", { personId }),
}));