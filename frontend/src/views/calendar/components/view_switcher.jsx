import { VIEWS } from "../view_modes";
import classes from "./view_switcher.module.css";

export default function ViewSwitcher({ view, onChange }) {
  return (
    <div className={classes.switcher}>
      {VIEWS.map((v) => (
        <button
          key={v.label}
          type="button"
          className={view === v.value ? `${classes.btn} ${classes.active}` : classes.btn}
          onClick={() => onChange(v.value)}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}