import classes from "./list_item.module.css";

export default function ListItem(props) {
  const { item, onToggle, onRemove } = props;
  const done = item.is_done;

  return (
    <li className={classes.item}>
      <span
        className={done ? `${classes.chk} ${classes.done}` : classes.chk}
        onClick={onToggle}
      >
        {done ? "✓" : ""}
      </span>
      <span
        className={done ? `${classes.name} ${classes.crossed}` : classes.name}
      >
        {item.itemName}
      </span>
      <span className={classes.del} title="Remove item" onClick={onRemove}>
        ✕
      </span>
    </li>
  );
}