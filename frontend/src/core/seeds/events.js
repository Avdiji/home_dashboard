// Shared family calendar events (SEED_EVENTS). Lives in `core/seeds/` (like
// SEED_PERSONS) because the dashboard's "upcoming" list is a view over the
// same events — clicking an upcoming card navigates to the calendar and opens
// that event's edit modal, so the dashboard must reference the real event ids.
// Per-feature data still seeds in its own hook; this is the cross-feature
// reference-data exception (events are shared between calendar + dashboard
// upcoming), converging to a single backend fetch once it lands.

import { EventDTO } from "../dto/event.dto";
import {
  FREQUENCY_NONE,
  FREQUENCY_DAILY,
  FREQUENCY_WEEKLY,
  FREQUENCY_MONTHLY,
} from "../frequency";

const today0 = new Date();
const at = (day, h, m = 0) => {
  const d = new Date(today0);
  d.setDate(d.getDate() + day);
  d.setHours(h, m, 0, 0);
  return d;
};

export const SEED_EVENTS = [
  new EventDTO({
    id: 1,
    title: "Dentist Anna",
    description: "Checkup at Dr. Müller.",
    location: "Zahnarzt Praxis",
    start_at: at(0, 9),
    end_at: at(0, 10),
    person_ids: [1],
    frequency: FREQUENCY_NONE,
  }).toModel(),
  new EventDTO({
    id: 2,
    title: "Morning standup",
    description: "",
    location: "Office",
    start_at: at(-30, 8),
    end_at: at(-30, 8, 30),
    person_ids: [],
    frequency: FREQUENCY_DAILY,
  }).toModel(),
  new EventDTO({
    id: 3,
    title: "Football practice",
    description: "Don't forget shin pads.",
    location: "Sportplatz",
    start_at: at(1, 17),
    end_at: at(1, 18, 30),
    person_ids: [2, 3],
    frequency: FREQUENCY_WEEKLY,
  }).toModel(),
  new EventDTO({
    id: 4,
    title: "Pay rent",
    description: "",
    location: "",
    start_at: at(5, 0),
    end_at: at(5, 0, 1),
    person_ids: [2],
    frequency: FREQUENCY_MONTHLY,
  }).toModel(),
  new EventDTO({
    id: 5,
    title: "Lunch with Mark",
    description: "Try the new place.",
    location: "Café Sol",
    start_at: at(2, 12),
    end_at: at(2, 13),
    person_ids: [2],
    frequency: FREQUENCY_NONE,
  }).toModel(),
  new EventDTO({
    id: 6,
    title: "School pickup",
    description: "",
    location: "Grundschule Nord",
    start_at: at(-60, 14, 30),
    end_at: at(-60, 15),
    person_ids: [1, 3],
    frequency: FREQUENCY_WEEKLY,
  }).toModel(),
];