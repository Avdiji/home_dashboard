import { create } from "zustand";
import { SEED_LISTS } from "../core/seeds/checklists";

// Centralized checklist lists state. Single source of truth shared by the
// checklist feature (list/item CRUD) and the dashboard (the checklist glance —
// a view over the same lists). Module-level store — no provider needed;
// subscribe via `useChecklists((s) => s.lists)`.
//
// Seeds still define the initial state; swap for a fetch once the backend
// lands. Mutations are noops with full signatures — the signature is the spec
// for the future backend call. Websocket wiring (later stage) calls these
// actions / set() on incoming list pushes so every client updates.

export const useChecklists = create(() => ({
  lists: SEED_LISTS,
  // noop — toggle item wiring handled once backend lands
  toggleItem: (listId, itemId) => {},
  // noop — remove item wiring handled once backend lands
  removeItem: (listId, itemId) => {},
  // noop — add item wiring handled once backend lands
  addItem: (listId, label) => {},
  // noop — update title wiring handled once backend lands
  updateTitle: (listId, title) => {},
  // noop — add list wiring handled once backend lands
  addList: ({ title, personIds }) => {},
  // noop — remove list wiring handled once backend lands
  removeList: (listId) => {},
  // noop — assign member wiring handled once backend lands
  toggleListAssignee: (listId, personId) => {},
}));