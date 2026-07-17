import classes from "./member_filter.module.css";

export default function MemberFilter({
  persons,
  activeFilters,
  onToggle,
  onAll,
}) {
  const allActive = activeFilters.size === 0;

  return (
    <div className={classes.filter}>
      <button
        className={allActive ? `${classes.chip} ${classes.active}` : classes.chip}
        onClick={onAll}
      >
        All
      </button>
      {persons.map((p) => {
        const on = activeFilters.has(p.id);
        return (
          <button
            key={p.id}
            className={on ? `${classes.chip} ${classes.active}` : classes.chip}
            onClick={() => onToggle(p.id)}
          >
            {p.name}
          </button>
        );
      })}
    </div>
  );
}