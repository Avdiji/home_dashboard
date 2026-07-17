import { useState } from "react";
import AddButton from "../../../components/buttons/add_button";
import AssignPicker from "../../../components/assign_picker/assign_picker";
import classes from "./task_form.module.css";

export default function TaskForm({ persons, onAdd }) {
  const [label, setLabel] = useState("");
  const [assigned, setAssigned] = useState(() => new Set());

  const toggleAssign = (id) => {
    setAssigned((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = () => {
    onAdd({ label, personIds: [...assigned] });
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
      <div className={classes.controls}>
        <AssignPicker
          persons={persons}
          selected={assigned}
          onToggle={toggleAssign}
        />
        <AddButton size="sm" onClick={submit}>
          +
        </AddButton>
      </div>
    </div>
  );
}