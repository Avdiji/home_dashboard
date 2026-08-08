import { create } from "zustand";
import { SEED_EVENTS } from "../core/seeds/events";
import { sendCommand } from "../core/api/transport";

// Centralized calendar events state. Single source of truth shared by the
// calendar (event CRUD) and the dashboard (upcoming list — a view over the
// same events so a row click deep-links to the real event id). Module-level
// store — no provider needed; subscribe via `useEvents((s) => s.events)`.
//
// Seeds still define the initial state; `loadAll()` swaps them for the fetched
// events on mount. Mutations fire WS commands (no optimistic local update —
// the broadcast round-trip updates every client via applyEvent). The hook/view
// pass camelCase + Date objects; the action maps them to the snake_case /
// ISO-string wire shape the backend command expects.

export const useEvents = create(() => ({
  events: SEED_EVENTS,
  // event.add — start/end are Date → ISO strings on the wire.
  addEvent: ({
    title,
    description,
    location,
    start,
    end,
    personIds,
    frequency,
  }) =>
    sendCommand("event.add", {
      title,
      description,
      location,
      start_at: start instanceof Date ? start.toISOString() : start,
      end_at: end instanceof Date ? end.toISOString() : end,
      person_ids: personIds,
      frequency,
    }),
  // event.update — full patch; backend pointers treat each field as "provided".
  // Empty strings clear; absent keys would be no-op (the form always sends all).
  updateEvent: (eventId, patch) =>
    sendCommand("event.update", {
      eventId,
      title: patch.title,
      description: patch.description,
      location: patch.location,
      start_at: patch.start instanceof Date ? patch.start.toISOString() : patch.start,
      end_at: patch.end instanceof Date ? patch.end.toISOString() : patch.end,
      person_ids: patch.personIds,
      frequency: patch.frequency,
    }),
  // event.delete — { eventId }
  removeEvent: (eventId) =>
    sendCommand("event.delete", { eventId }),
}));