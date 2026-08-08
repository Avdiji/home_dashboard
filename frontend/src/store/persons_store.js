import { create } from "zustand";
import { sendCommand } from "../core/api/transport";

// Centralized persons (family roster) state. Single source of truth shared by
// the dashboard (members section), calendar (event assignee picker), and
// checklist (list assignee picker). Module-level store — no provider needed;
// any component subscribes via `usePersons((s) => s.persons)`.
//
// Initial state is empty; `loadAll()` hydrates the roster from the backend on
// mount, and broadcast events keep it in sync (no optimistic local update — the
// broadcast round-trip, delivered to every client including this one, updates
// the store via applyEvent). The action signature stays the spec for the
// command payload.

export const usePersons = create(() => ({
  persons: [],
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