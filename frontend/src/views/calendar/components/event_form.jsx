import { useState } from "react";
import { FREQUENCIES, FREQUENCY_NONE } from "../../../core/frequency";
import {
  toLocalInputValue,
  fromLocalInputValue,
  addHour,
} from "../../../core/utils/date_utils";
import AssignPicker from "../../../components/assign_picker/assign_picker";
import Modal from "../../../components/modal/modal";
import controls from "../../../components/forms/form_controls.module.css";
import classes from "./event_form.module.css";

const field = (d) => toLocalInputValue(d);

export default function EventForm({
  persons,
  event = null,
  initialStart,
  occurrenceStart = null,
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
  const [frequency, setFrequency] = useState(event?.frequency ?? FREQUENCY_NONE);
  const [interval, setInterval] = useState(event?.interval ?? 1);

  const toggleAssign = (id) => {
    setAssigned((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Keep end at/after start. Moving start past end bumps end to start+1h so
  // the two fields can never describe an event that ends before it begins.
  const onStartChange = (v) => {
    setStart(v);
    const s = fromLocalInputValue(v);
    if (fromLocalInputValue(end) <= s) setEnd(field(addHour(s, 1)));
  };

  const endBeforeStart = fromLocalInputValue(end) <= fromLocalInputValue(start);

  const payload = () => ({
    title: title.trim(),
    description: description.trim(),
    location: location.trim(),
    start: fromLocalInputValue(start),
    end: fromLocalInputValue(end),
    personIds: [...assigned],
    frequency,
    interval: frequency === FREQUENCY_NONE ? 1 : Math.max(1, Number(interval) || 1),
  });

  const submit = () => {
    if (!title.trim() || endBeforeStart) return;
    if (event) onUpdate?.(event.id, payload());
    else onSave?.(payload());
    onClose();
  };

  const remove = () => {
    if (event) onDelete?.(event, occurrenceStart);
    onClose();
  };

  return (
    <Modal
      title={event ? "Edit event" : "New event"}
      onClose={onClose}
      onSave={submit}
      saveDisabled={!title.trim() || endBeforeStart}
      onDelete={event ? remove : null}
    >
      <label className={controls.row}>
        <span className={controls.lbl}>Title</span>
        <input
          className={controls.input}
          value={title}
          placeholder="What's the event?"
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <label className={controls.row}>
        <span className={controls.lbl}>Location</span>
        <input
          className={controls.input}
          value={location}
          placeholder="Optional"
          onChange={(e) => setLocation(e.target.value)}
        />
      </label>

      <div className={`${classes.dates} ${controls.gap_above}`}>
        <label className={controls.row}>
          <span className={controls.lbl}>Start</span>
          <input
            type="datetime-local"
            className={controls.input}
            value={start}
            onChange={(e) => onStartChange(e.target.value)}
          />
        </label>
        <label className={controls.row}>
          <span className={controls.lbl}>End</span>
          <input
            type="datetime-local"
            className={controls.input}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
      </div>

      <div className={`${controls.row} ${controls.gap_above}`}>
        <span className={controls.lbl}>Members</span>
        <AssignPicker persons={persons} selected={assigned} onToggle={toggleAssign} />
      </div>

      <div className={`${classes.repeat} ${controls.row}`}>
        <span className={controls.lbl}>Repeat</span>
        <div className={classes.repeatControls}>
          {frequency !== FREQUENCY_NONE && (
            <>
              <span className={classes.every}>Every</span>
              <input
                type="number"
                min="1"
                max="99"
                className={`${controls.input} ${classes.interval}`}
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
              />
            </>
          )}
          <select
            className={controls.select}
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      <label className={`${controls.row} ${controls.col} ${controls.gap_above}`}>
        <span className={controls.lbl}>Description</span>
        <textarea
          className={controls.textarea}
          value={description}
          placeholder="Optional"
          rows={3}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
    </Modal>
  );
}