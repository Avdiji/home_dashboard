import classes from "./tab_switcher.module.css";

const TABS = [
  { id: "planned", label: "Planned dishes" },
  { id: "recipes", label: "Recipes" },
];

export default function TabSwitcher({ tab, onChange }) {
  return (
    <div className={classes.switcher}>
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={tab === t.id ? `${classes.btn} ${classes.active}` : classes.btn}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}