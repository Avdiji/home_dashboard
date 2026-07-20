import CalendarNav from "./components/calendar_nav";
import { VIEW_DAY, VIEW_WEEK, VIEW_MONTH } from "./view_modes";
import ViewSwitcher from "./components/view_switcher";
import MonthView from "./components/month_view";
import WeekView from "./components/week_view";
import DayView from "./components/day_view";
import EventForm from "./components/event_form";
import useCalendar from "./hooks/use_calendar";
import classes from "./calendar.module.css";

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
  } = useCalendar();

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