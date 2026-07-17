import { useState } from "react";
import AddButton from "../../../components/buttons/add_button";
import { FREQUENCIES } from "../../../core/frequency";
import classes from "./task_form.module.css";

export default function TaskForm({ persons, onAdd }) {
  const [label, setLabel] = useState("");
  const [personId, setPersonId] = useState(persons[0]?.id ?? "");
  const [frequency, setFrequency] = useState("none");

  const submit = () => {
    onAdd({ label, personId, frequency });
    setLabel("");
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
      <select
        className={classes.select}
        value={personId}
        onChange={(e) => setPersonId(Number(e.target.value))}
        aria-label="Assign to"
      >
        {persons.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
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