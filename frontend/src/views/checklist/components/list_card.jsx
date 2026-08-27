import { useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "../../../components/cards/card";
import AddButton from "../../../components/buttons/add_button";
import RemoveButton from "../../../components/buttons/remove_button";
import AssignPicker from "../../../components/assign_picker/assign_picker";
import ListItem from "./list_item";
import classes from "./list_card.module.css";

export default function ListCard(props) {
  const {
    list,
    persons,
    onToggleItem,
    onRemoveItem,
    onUpdateTitle,
    onRemoveList,
    onAddItem,
    onToggleAssignee,
  } = props;
  const { t } = useTranslation();
  const [draft, setDraft] = useState("");

  return (
    <Card
      title={
        <input
          className={classes.title_input}
          value={list.title}
          onChange={(e) => onUpdateTitle(list.id, e.target.value)}
          aria-label={t("checklist.listTitleAria")}
        />
      }
      badge={t("checklist.itemsLeft", { count: list.remainingItems })}
      headerActions={
        <RemoveButton title={t("checklist.removeList")} onClick={() => onRemoveList(list.id)} />
      }
    >
      <div className={classes.assignRow}>
        <AssignPicker
          persons={persons}
          selected={new Set(list.personIds)}
          onToggle={(id) => onToggleAssignee(list.id, id)}
        />
      </div>

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
          placeholder={t("checklist.addItemPlaceholder")}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onAddItem(list.id, draft);
          }}
        />
        <AddButton size="sm" onClick={() => onAddItem(list.id, draft)}>
          +
        </AddButton>
      </div>
    </Card>
  );
}