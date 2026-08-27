import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import RemoveButton from "../../../components/buttons/remove_button";
import { CHECKLIST_AUTO_DELETE_MS } from "../../../core/constants";
import classes from "./list_item.module.css";

export default function ListItem(props) {
  const { item, allChecked, onToggle, onRemove } = props;
  const { t } = useTranslation();
  const done = item.is_done;

  // Auto-delete: once an item is checked off, the user has a short grace window
  // to uncheck (undo) before it's removed automatically. The timer keys on
  // `done` so unchecking cancels it; onRemove is read through a ref so the effect
  // doesn't reset on every parent re-render. Suppressed when every item is
  // checked — then the list itself auto-deletes (handled by ListCard), so the
  // items don't each self-delete first.
  const removeRef = useRef(onRemove);
  removeRef.current = onRemove;
  useEffect(() => {
    if (!done || allChecked) return;
    const id = setTimeout(() => removeRef.current(), CHECKLIST_AUTO_DELETE_MS);
    return () => clearTimeout(id);
  }, [done, allChecked]);

  return (
    <li className={done ? `${classes.item} ${classes.packing}` : classes.item}>
      <span
        className={done ? `${classes.chk} ${classes.done}` : classes.chk}
        onClick={onToggle}
      >
        {done ? "✓" : ""}
      </span>
      <span
        className={done ? `${classes.name} ${classes.crossed}` : classes.name}
      >
        {item.itemName}
      </span>
      <RemoveButton title={t("checklist.removeItem")} size="sm" onClick={onRemove} />
    </li>
  );
}