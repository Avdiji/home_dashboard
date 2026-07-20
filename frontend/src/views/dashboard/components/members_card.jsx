import classes from "./members_card.module.css";

const initials = (name) => (name?.trim()?.[0] ?? "?").toUpperCase();

export default function MembersCard({ persons, onAdd, onEdit, onRemove }) {
  return (
    <div className={classes.wrap}>
      <div className={classes.row}>
        {persons.map((p) => (
          <div key={p.id} className={classes.chip}>
            <span className={classes.avatar}>{initials(p.name)}</span>
            <button
              type="button"
              className={classes.name}
              onClick={() => onEdit(p)}
              title="Edit member"
            >
              {p.name}
            </button>
            <button
              type="button"
              className={classes.remove}
              title="Remove member"
              onClick={() => onRemove(p.id)}
            >
              ✕
            </button>
          </div>
        ))}
        {persons.length === 0 && <span className={classes.empty}>No members yet</span>}
      </div>
      <button type="button" className={classes.add} onClick={onAdd}>
        + Add member
      </button>
    </div>
  );
}