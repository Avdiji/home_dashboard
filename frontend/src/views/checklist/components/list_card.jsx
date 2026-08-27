import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Card from "../../../components/cards/card";
import AddButton from "../../../components/buttons/add_button";
import RemoveButton from "../../../components/buttons/remove_button";
import AssignPicker from "../../../components/assign_picker/assign_picker";
import { CHECKLIST_AUTO_DELETE_MS } from "../../../core/constants";
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
  // Derive the remaining count from the items so it always reflects the actual
  // state, regardless of how the store mutates the list.
  const remaining = list.items.filter((i) => !i.is_done).length;
  // Add the typed item, then clear the field. Empty/whitespace is ignored so we
  // don't create blank items (and don't clobber a draft the user is still typing).
  const submitItem = () => {
    const label = draft.trim();
    if (!label) return;
    onAddItem(list.id, label);
    setDraft("");
  };
  // When every item is checked off, the whole list auto-deletes after the same
  // grace window (uncheck any to cancel). Per-item auto-delete is suppressed in
  // this case so the list deletion is authoritative (no race between item and
  // list timers). A freshly empty list (length 0) is excluded — it hasn't been
  // "checked off", it just has no items yet.
  const allChecked = list.items.length > 0 && list.items.every((i) => i.is_done);
  const removeListRef = useRef(onRemoveList);
  removeListRef.current = onRemoveList;
  useEffect(() => {
    if (!allChecked) return;
    const id = setTimeout(() => removeListRef.current(list.id), CHECKLIST_AUTO_DELETE_MS);
    return () => clearTimeout(id);
  }, [allChecked, list.id]);

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
      badge={t("checklist.itemsLeft", { count: remaining })}
      badgeClassName={classes.items_left}
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
            allChecked={allChecked}
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
            if (e.key === "Enter") submitItem();
          }}
        />
        <AddButton size="sm" onClick={submitItem}>
          +
        </AddButton>
      </div>
    </Card>
  );
}