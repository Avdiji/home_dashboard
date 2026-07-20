import Card from "../../../components/cards/card";
import AddButton from "../../../components/buttons/add_button";
import RemoveButton from "../../../components/buttons/remove_button";
import classes from "./members_card.module.css";

const initials = (name) =>
  (name?.trim()?.[0] ?? "?").toUpperCase();

export default function MembersCard({ persons, onAdd, onEdit, onRemove }) {
  return (
    <Card
      title="Members"
      headerActions={
        <AddButton onClick={onAdd}>+ Add</AddButton>
      }
    >
      <ul className={classes.list}>
        {persons.map((p) => (
          <li key={p.id} className={classes.row}>
            <span className={classes.avatar}>{initials(p.name)}</span>
            <button
              type="button"
              className={classes.name}
              onClick={() => onEdit(p)}
              title="Edit"
            >
              {p.name}
            </button>
            <RemoveButton
              title="Remove member"
              onClick={() => onRemove(p.id)}
            />
          </li>
        ))}
        {persons.length === 0 && (
          <li className={classes.empty}>No members yet</li>
        )}
      </ul>
    </Card>
  );
}