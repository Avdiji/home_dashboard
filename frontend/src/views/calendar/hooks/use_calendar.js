import { useMemo, useState } from "react";
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

export default function useCalendar({ events: initialEvents, persons: initialPersons }) {
  const [events] = useState(initialEvents);
  const [persons] = useState(initialPersons);
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