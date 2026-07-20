import { create } from "zustand";
import { SEED_EVENTS } from "../core/seeds/events";

// Centralized calendar events state. Single source of truth shared by the
// calendar (event CRUD) and the dashboard (upcoming list — a view over the
// same events so a row click deep-links to the real event id). Module-level
// store — no provider needed; subscribe via `useEvents((s) => s.events)`.
//
// Seeds still define the initial state; swap for a fetch once the backend
// lands. Mutations are noops with full signatures — the signature is the spec
// for the future backend call. Websocket wiring (later stage) calls these
// actions / set() on incoming event pushes so every client updates.

export const useEvents = create(() => ({
  events: SEED_EVENTS,
  // noop — add event wiring handled once backend lands
  addEvent: ({
    title,
    description,
    location,
    start,
    end,
    personIds,
    frequency,
  }) => {},
  // noop — update event wiring handled once backend lands
  updateEvent: (eventId, patch) => {},
  // noop — remove event wiring handled once backend lands
  removeEvent: (eventId) => {},
}));