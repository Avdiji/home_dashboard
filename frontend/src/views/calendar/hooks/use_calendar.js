import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SEED_EVENTS } from "../../../core/seeds/events";
import { SEED_PERSONS } from "../../../core/seeds/persons";
import { CALENDAR_PATH } from "../../../core/nav_config";
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

export default function useCalendar() {
  const [events] = useState(SEED_EVENTS);
  const [persons] = useState(SEED_PERSONS);
  const [view, setView] = useState(VIEW_DAY);
  const [cursor, setCursor] = useState(() => new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formStart, setFormStart] = useState(null);

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
    setEditingEvent(occ.event);
    setFormStart(null);
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  // Cross-feature deep link: another view (e.g. the dashboard upcoming list)
  // navigates here with `{ editEventId }` to open that event's edit modal.
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const editEventId = location.state?.editEventId;
    if (editEventId == null) return;
    const found = events.find((e) => e.id === editEventId);
    if (found) {
      setEditingEvent(found);
      setFormStart(null);
      setFormOpen(true);
    }
    // Consume the state so a back/forward re-entry doesn't reopen the modal.
    navigate(CALENDAR_PATH, { replace: true, state: null });
  }, [location.state, events, navigate]);

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