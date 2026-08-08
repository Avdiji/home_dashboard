import { create } from "zustand";
import { SEED_LISTS } from "../core/seeds/checklists";
import { sendCommand } from "../core/api/transport";

// Centralized checklist lists state. Single source of truth shared by the
// checklist feature (list/item CRUD) and the dashboard (the checklist glance —
// a view over the same lists). Module-level store — no provider needed;
// subscribe via `useChecklists((s) => s.lists)`.
//
// Seeds still define the initial state; `loadAll()` swaps them for the fetched
// lists on mount. Mutations fire WS commands (no optimistic local update — the
// broadcast round-trip updates every client via applyEvent). The action
// signature stays the spec for the command payload.

export const useChecklists = create(() => ({
  lists: SEED_LISTS,
  // checklist.item.toggle — { listId, itemId }
  toggleItem: (listId, itemId) =>
    sendCommand("checklist.item.toggle", { listId, itemId }),
  // checklist.item.delete — { listId, itemId }
  removeItem: (listId, itemId) =>
    sendCommand("checklist.item.delete", { listId, itemId }),
  // checklist.item.add — { listId, label }
  addItem: (listId, label) =>
    sendCommand("checklist.item.add", { listId, label }),
  // checklist.updateTitle — { listId, title }
  updateTitle: (listId, title) =>
    sendCommand("checklist.updateTitle", { listId, title }),
  // checklist.add — { title, person_ids }
  addList: ({ title, personIds }) =>
    sendCommand("checklist.add", { title, person_ids: personIds }),
  // checklist.delete — { listId }
  removeList: (listId) =>
    sendCommand("checklist.delete", { listId }),
  // checklist.toggleAssignee — { listId, personId }
  toggleListAssignee: (listId, personId) =>
    sendCommand("checklist.toggleAssignee", { listId, personId }),
}));