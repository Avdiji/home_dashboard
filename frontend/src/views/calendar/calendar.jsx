import { PersonDTO } from "../../core/dto/person.dto";
import { EventDTO } from "../../core/dto/event.dto";
import { VIEW_DAY, VIEW_WEEK, VIEW_MONTH } from "./view_modes";
import CalendarNav from "./components/calendar_nav";
import ViewSwitcher from "./components/view_switcher";
import MonthView from "./components/month_view";
import WeekView from "./components/week_view";
import DayView from "./components/day_view";
import EventForm from "./components/event_form";
import useCalendar from "./hooks/use_calendar";
import classes from "./calendar.module.css";

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

export default function Calendar() {
  const {
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
  } = useCalendar({ events: SEED_EVENTS, persons: SEED_PERSONS });

  return (
    <div className={classes.view}>
      <div className={classes.toolbar}>
        <CalendarNav
          title={title}
          onPrev={goPrev}
          onNext={goNext}
          onToday={goToday}
        />
        <div className={classes.right}>
          <ViewSwitcher view={view} onChange={setView} />
          <button type="button" className={classes.new_btn} onClick={() => openNewForm(new Date())}>
            + New event
          </button>
        </div>
      </div>

      <div className={classes.surface}>
        {view === VIEW_MONTH && (
          <MonthView
            cursor={cursor}
            events={events}
            persons={persons}
            onSelectOccurrence={openEditForm}
            onSelectDay={(day) => openNewForm(day)}
          />
        )}
        {view === VIEW_WEEK && (
          <WeekView
            cursor={cursor}
            events={events}
            persons={persons}
            onSelectOccurrence={openEditForm}
            onSelectDay={(day) => openNewForm(day)}
          />
        )}
        {view === VIEW_DAY && (
          <DayView
            cursor={cursor}
            events={events}
            persons={persons}
            onSelectOccurrence={openEditForm}
          />
        )}
      </div>

      {formOpen && (
        <EventForm
          persons={persons}
          event={editingEvent}
          initialStart={formStart}
          onClose={closeForm}
          onSave={addEvent}
          onUpdate={updateEvent}
          onDelete={removeEvent}
        />
      )}
    </div>
  );
}