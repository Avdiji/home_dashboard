import { MONTHS } from "../../../core/utils/date_utils";
import classes from "./members_card.module.css";

const initials = (name) => (name?.trim()?.[0] ?? "?").toUpperCase();

// "Jul 23" from an ISO "YYYY-MM-DD" birthday, or null. Parsed as local so the
// day doesn't shift with timezone.
const birthdayLabel = (iso) => {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
};

export default function MembersCard({ persons, onAdd, onEdit, onRemove }) {
  return (
    <div className={classes.wrap}>
      <div className={classes.row}>
        {persons.map((p) => {
          const bday = birthdayLabel(p.birthday);
          return (
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
              {bday && <span className={classes.bday}>🎂 {bday}</span>}
              <button
                type="button"
                className={classes.remove}
                title="Remove member"
                onClick={() => onRemove(p.id)}
              >
                ✕
              </button>
            </div>
          );
        })}
        {persons.length === 0 && <span className={classes.empty}>No members yet</span>}
      </div>
      <button type="button" className={classes.add} onClick={onAdd}>
        + Add member
      </button>
    </div>
  );
}