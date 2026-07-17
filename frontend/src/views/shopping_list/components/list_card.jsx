import { useState } from "react";
import Card from "../../../components/cards/card";
import AddButton from "../../../components/buttons/add_button";
import ListItem from "./list_item";
import classes from "./list_card.module.css";

export default function ListCard(props) {
  const {
    list,
    onToggleItem,
    onRemoveItem,
    onUpdateTitle,
    onRemoveList,
    onAddItem,
  } = props;
  const [draft, setDraft] = useState("");

  return (
    <Card
      title={
        <input
          className={classes.title_input}
          value={list.title}
          onChange={(e) => onUpdateTitle(list.id, e.target.value)}
          aria-label="List title"
        />
      }
      badge={`${list.remainingItems} left`}
      headerActions={
        <span
          className={classes.list_remove}
          title="Remove list"
          onClick={() => onRemoveList(list.id)}
        >
          ✕
        </span>
      }
    >
      <ul className={classes.items}>
        {list.items.map((item) => (
          <ListItem
            key={item.id}
            item={item}
            onToggle={() => onToggleItem(list.id, item.id)}
            onRemove={() => onRemoveItem(list.id, item.id)}
          />
        ))}
      </ul>

      <div className={classes.add_row}>
        <input
          className={classes.add_input}
          value={draft}
          placeholder="Add item…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onAddItem(list.id, draft);
          }}
        />
        <AddButton size="sm" onClick={() => onAddItem(list.id, draft)}>
          Add
        </AddButton>
      </div>
    </Card>
  );
}