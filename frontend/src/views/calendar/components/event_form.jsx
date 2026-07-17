import { useState } from "react";
import { FREQUENCIES } from "../../../core/frequency";
import {
  toLocalInputValue,
  fromLocalInputValue,
  addHour,
} from "../../../core/utils/date_utils";
import AssignPicker from "../../todo_list/components/assign_picker";
import classes from "./event_form.module.css";

const field = (d) => toLocalInputValue(d);

export default function EventForm({
  persons,
  event = null,
  initialStart,
  onClose,
  onSave,
  onUpdate,
  onDelete,
}) {
  const startInit = initialStart ?? new Date();
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [start, setStart] = useState(field(event?.start ?? startInit));
  const [end, setEnd] = useState(field(event?.end ?? addHour(startInit, 1)));
  const [assigned, setAssigned] = useState(() => new Set(event?.personIds ?? []));
  const [frequency, setFrequency] = useState(event?.frequency ?? "none");

  const toggleAssign = (id) => {
    setAssigned((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const payload = () => ({
    title: title.trim(),
    description: description.trim(),
    location: location.trim(),
    start: fromLocalInputValue(start),
    end: fromLocalInputValue(end),
    personIds: [...assigned],
    frequency,
  });

  const submit = () => {
    if (!title.trim()) return;
    if (event) onUpdate?.(event.id, payload());
    else onSave?.(payload());
    onClose();
  };

  const remove = () => {
    if (event) onDelete?.(event.id);
    onClose();
  };

  return (
    <div className={classes.overlay} onClick={onClose}>
      <div className={classes.dialog} onClick={(e) => e.stopPropagation()}>
        <h2 className={classes.title}>{event ? "Edit event" : "New event"}</h2>

        <label className={classes.row}>
          <span className={classes.lbl}>Title</span>
          <input
            className={classes.input}
            value={title}
            placeholder="What's the event?"
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label className={classes.row}>
          <span className={classes.lbl}>Location</span>
          <input
            className={classes.input}
            value={location}
            placeholder="Optional"
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>

        <div className={`${classes.dates} ${classes.gap_above}`}>
          <label className={classes.row}>
            <span className={classes.lbl}>Start</span>
            <input
              type="datetime-local"
              className={classes.input}
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label className={classes.row}>
            <span className={classes.lbl}>End</span>
            <input
              type="datetime-local"
              className={classes.input}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
        </div>

        <div className={`${classes.row} ${classes.gap_above}`}>
          <span className={classes.lbl}>Members</span>
          <AssignPicker persons={persons} selected={assigned} onToggle={toggleAssign} />
        </div>

        <label className={classes.row}>
          <span className={classes.lbl}>Repeat</span>
          <select
            className={classes.select}
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </label>

        <label className={`${classes.row} ${classes.col} ${classes.gap_above}`}>
          <span className={classes.lbl}>Description</span>
          <textarea
            className={classes.textarea}
            value={description}
            placeholder="Optional"
            rows={3}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div className={classes.actions}>
          {event && (
            <button type="button" className={classes.delete} onClick={remove}>
              Delete
            </button>
          )}
          <div className={classes.actions_right}>
            <button type="button" className={classes.cancel} onClick={onClose}>Cancel</button>
            <button type="button" className={classes.save} onClick={submit} disabled={!title.trim()}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}