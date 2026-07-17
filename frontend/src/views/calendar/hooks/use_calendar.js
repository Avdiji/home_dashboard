import { useMemo, useState } from "react";
import { PersonDTO } from "../../../core/dto/person.dto";
import { EventDTO } from "../../../core/dto/event.dto";
import {
  formatMonthTitle,
  formatWeekTitle,
  formatDayTitle,
  startOfWeek,
  endOfWeek,
  addDay,
  addWeek,
  addMonth,
} from "../../../core/utils/date_utils";
import { VIEW_DAY, VIEW_WEEK, VIEW_MONTH } from "../view_modes";

const SEED_PERSONS = [
  new PersonDTO({ id: 1, name: "Anna" }).toModel(),
  new PersonDTO({ id: 2, name: "Mark" }).toModel(),
  new PersonDTO({ id: 3, name: "Lena" }).toModel(),
];

const today0 = new Date();
const at = (day, h, m = 0) => {
  const d = new Date(today0);
  d.setDate(d.getDate() + day);
  d.setHours(h, m, 0, 0);
  return d;
};

const SEED_EVENTS = [
  new EventDTO({
    id: 1,
    title: "Dentist Anna",
    description: "Checkup at Dr. Müller.",
    location: "Zahnarzt Praxis",
    start_at: at(0, 9),
    end_at: at(0, 10),
    person_ids: [1],
    frequency: "none",
  }).toModel(),
  new EventDTO({
    id: 2,
    title: "Morning standup",
    description: "",
    location: "Office",
    start_at: at(-30, 8),
    end_at: at(-30, 8, 30),
    person_ids: [],
    frequency: "daily",
  }).toModel(),
  new EventDTO({
    id: 3,
    title: "Football practice",
    description: "Don't forget shin pads.",
    location: "Sportplatz",
    start_at: at(1, 17),
    end_at: at(1, 18, 30),
    person_ids: [2, 3],
    frequency: "weekly",
  }).toModel(),
  new EventDTO({
    id: 4,
    title: "Pay rent",
    description: "",
    location: "",
    start_at: at(5, 0),
    end_at: at(5, 0, 1),
    person_ids: [2],
    frequency: "monthly",
  }).toModel(),
  new EventDTO({
    id: 5,
    title: "Lunch with Mark",
    description: "Try the new place.",
    location: "Café Sol",
    start_at: at(2, 12),
    end_at: at(2, 13),
    person_ids: [2],
    frequency: "none",
  }).toModel(),
  new EventDTO({
    id: 6,
    title: "School pickup",
    description: "",
    location: "Grundschule Nord",
    start_at: at(-60, 14, 30),
    end_at: at(-60, 15),
    person_ids: [1, 3],
    frequency: "weekly",
  }).toModel(),
];

export default function useCalendar() {
  const [events] = useState(SEED_EVENTS);
  const [persons] = useState(SEED_PERSONS);
  const [view, setView] = useState(VIEW_DAY);
  const [cursor, setCursor] = useState(() => new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formStart, setFormStart] = useState(null);

  // noop — fetch single full event (use if the list is a summary);
  // full data already in `events` for now, so edit reads from memory.
  const getEvent = (eventId) => events.find((e) => e.id === eventId) ?? null;
  // noop — add wiring handled once backend lands
  const addEvent = ({
    title,
    description,
    location,
    start,
    end,
    personIds,
    frequency,
  }) => {};
  // noop — update event wiring handled once backend lands
  const updateEvent = (eventId, patch) => {};
  // noop — remove event wiring handled once backend lands
  const removeEvent = (eventId) => {};

  const goPrev = () => {
    setCursor((c) =>
      view === VIEW_DAY ? addDay(c, -1) : view === VIEW_WEEK ? addWeek(c, -1) : addMonth(c, -1),
    );
  };
  const goNext = () => {
    setCursor((c) =>
      view === VIEW_DAY ? addDay(c, 1) : view === VIEW_WEEK ? addWeek(c, 1) : addMonth(c, 1),
    );
  };
  const goToday = () => setCursor(new Date());

  const title = useMemo(() => {
    if (view === VIEW_MONTH) return formatMonthTitle(cursor);
    if (view === VIEW_WEEK) return formatWeekTitle(startOfWeek(cursor), endOfWeek(cursor));
    return formatDayTitle(cursor);
  }, [view, cursor]);

  const openNewForm = (start) => {
    setEditingEvent(null);
    setFormStart(start ?? null);
    setFormOpen(true);
  };

  const openEditForm = (occ) => {
    // Full data is in memory; getEvent noop shows where a fetch would go if
    // the list becomes a summary.
    const full = getEvent(occ.event.id);
    setEditingEvent(full ?? occ.event);
    setFormStart(null);
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  return {
    events,
    persons,
    view,
    setView,
    cursor,
    goPrev,
    goNext,
    goToday,
    title,
    formOpen,
    editingEvent,
    formStart,
    openNewForm,
    openEditForm,
    closeForm,
    addEvent,
    updateEvent,
    removeEvent,
  };
}