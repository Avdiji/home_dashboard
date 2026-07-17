import { FREQUENCIES } from "../../../core/frequency";
import classes from "./task_item.module.css";

const FREQ_LABEL = Object.fromEntries(
  FREQUENCIES.map((f) => [f.value, f.label])
);

export default function TaskItem({ todo, personName, onToggle, onRemove }) {
  const done = todo.isDone;
  return (
    <li className={classes.item}>
      <span
        className={done ? `${classes.chk} ${classes.done}` : classes.chk}
        onClick={onToggle}
      >
        {done ? "✓" : ""}
      </span>
      <span
        className={done ? `${classes.text} ${classes.crossed}` : classes.text}
      >
        {todo.label}
        {todo.frequency !== "none" && (
          <span className={classes.freq}>{FREQ_LABEL[todo.frequency]}</span>
        )}
      </span>
      <span className={classes.who}>{personName}</span>
      <span className={classes.del} title="Remove" onClick={onRemove}>
        ✕
      </span>
    </li>
  );
}