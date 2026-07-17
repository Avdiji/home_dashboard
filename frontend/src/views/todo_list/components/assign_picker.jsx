import { useEffect, useRef, useState } from "react";
import classes from "./assign_picker.module.css";

export default function AssignPicker({
  persons,
  selected,
  onToggle,
  placeholder = "Assign members",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const selectedNames = persons
    .filter((p) => selected.has(p.id))
    .map((p) => p.name);

  const label =
    selectedNames.length === 0
      ? placeholder
      : selectedNames.length <= 2
        ? selectedNames.join(", ")
        : `${selectedNames.length} members`;

  return (
    <div className={classes.picker} ref={ref}>
      <button
        type="button"
        className={open ? `${classes.trigger} ${classes.open}` : classes.trigger}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={classes.trigger_label}>{label}</span>
        <span className={classes.caret}>{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div className={classes.popover}>
          <ul className={classes.list}>
            {persons.map((p) => {
              const on = selected.has(p.id);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    className={on ? `${classes.row} ${classes.on}` : classes.row}
                    onClick={() => onToggle(p.id)}
                  >
                    <span className={classes.box}>{on ? "✓" : ""}</span>
                    <span className={classes.row_name}>{p.name}</span>
                  </button>
                </li>
              );
            })}
            {persons.length === 0 && <li className={classes.empty}>No members</li>}
          </ul>
        </div>
      )}
    </div>
  );
}