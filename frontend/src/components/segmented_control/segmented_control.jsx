import classes from "./segmented_control.module.css";

export default function SegmentedControl({ items, value, onChange }) {
  return (
    <div className={classes.switcher}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={value === item.value ? `${classes.btn} ${classes.active}` : classes.btn}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}