import classes from "./task_item.module.css";

export default function TaskItem({ todo, personNames, onToggle, onRemove }) {
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
      </span>
      <span className={classes.who}>
        {personNames.map((n) => (
          <span key={n} className={classes.name_chip}>
            {n}
          </span>
        ))}
      </span>
      <span className={classes.del} title="Remove" onClick={onRemove}>
        ✕
      </span>
    </li>
  );
}