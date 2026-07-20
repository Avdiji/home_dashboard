import { create } from "zustand";
import { SEED_PERSONS } from "../core/seeds/persons";

// Centralized persons (family roster) state. Single source of truth shared by
// the dashboard (members section), calendar (event assignee picker), and
// checklist (list assignee picker). Module-level store — no provider needed;
// any component subscribes via `usePersons((s) => s.persons)`.
//
// Seeds still define the initial state (the "all data seeded" rule); swap the
// initializer for a fetch once the backend lands. Mutations are noops with
// full signatures — the signature is the spec for the future backend call.
// Websocket wiring (later stage) calls these actions / set() on incoming
// roster pushes so every client updates.

export const usePersons = create(() => ({
  persons: SEED_PERSONS,
  // noop — add person wiring handled once backend lands
  addPerson: ({ name }) => {},
  // noop — update person wiring handled once backend lands
  updatePerson: (personId, { name }) => {},
  // noop — remove person wiring handled once backend lands
  removePerson: (personId) => {},
}));