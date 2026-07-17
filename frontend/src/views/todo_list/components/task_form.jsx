import { useState } from "react";
import AddButton from "../../../components/buttons/add_button";
import { FREQUENCIES } from "../../../core/frequency";
import AssignPicker from "./assign_picker";
import classes from "./task_form.module.css";

export default function TaskForm({ persons, onAdd }) {
  const [label, setLabel] = useState("");
  const [assigned, setAssigned] = useState(() => new Set());
  const [frequency, setFrequency] = useState("none");

  const toggleAssign = (id) => {
    setAssigned((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = () => {
    onAdd({ label, personIds: [...assigned], frequency });
    setLabel("");
    setAssigned(new Set());
  };

  return (
    <div className={classes.form}>
      <input
        className={classes.input}
        value={label}
        placeholder="New task…"
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />
      <AssignPicker
        persons={persons}
        selected={assigned}
        onToggle={toggleAssign}
      />
      <select
        className={classes.select}
        value={frequency}
        onChange={(e) => setFrequency(e.target.value)}
        aria-label="Frequency"
      >
        {FREQUENCIES.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>
      <AddButton size="sm" onClick={submit}>
        +
      </AddButton>
    </div>
  );
}