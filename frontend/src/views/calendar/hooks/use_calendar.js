import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEvents } from "../../../store/events_store";
import { usePersons } from "../../../store/persons_store";
import { CALENDAR_PATH } from "../../../core/nav_config";
import {
  STATE_KEY_EDIT_EVENT_ID,
  STATE_KEY_EVENT_START,
} from "../../../core/constants";
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
  // Entity state lives in the centralized stores — the dashboard's upcoming
  // list reads the same `events`, so a calendar mutation (once the backend
  // lands) propagates everywhere. Noop action signatures come from the store.
  const events = useEvents((s) => s.events);
  const persons = usePersons((s) => s.persons);
  const addEvent = useEvents((s) => s.addEvent);
  const updateEvent = useEvents((s) => s.updateEvent);
  const removeEvent = useEvents((s) => s.removeEvent);

  const [view, setView] = useState(VIEW_DAY);
  const [cursor, setCursor] = useState(() => new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formStart, setFormStart] = useState(null);

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
  // navigates here with `{ editEventId, eventStart }` to open that event's edit
  // modal. eventStart is the occurrence start (ISO) so the calendar lands on the
  // occurrence's day — for recurring events this differs from the base start.
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const editEventId = location.state?.[STATE_KEY_EDIT_EVENT_ID];
    if (editEventId == null) return;
    const found = events.find((e) => e.id === editEventId);
    if (found) {
      const startIso = location.state?.[STATE_KEY_EVENT_START];
      if (startIso) setCursor(new Date(startIso));
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