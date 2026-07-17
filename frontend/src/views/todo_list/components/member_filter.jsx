import classes from "./member_filter.module.css";

export default function MemberFilter({
  persons,
  selectedMember,
  onToggle,
  onAll,
}) {
  const allActive = selectedMember == null;

  return (
    <div className={classes.filter}>
      <button
        className={allActive ? `${classes.chip} ${classes.active}` : classes.chip}
        onClick={onAll}
      >
        All
      </button>
      {persons.map((p) => {
        const on = selectedMember === p.id;
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