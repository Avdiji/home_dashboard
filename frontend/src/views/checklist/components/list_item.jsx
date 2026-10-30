import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import RemoveButton from "../../../components/buttons/remove_button";
import { CHECKLIST_AUTO_HIDE_MS } from "../../../core/constants";
import linkify from "../utils/linkify";
import classes from "./list_item.module.css";

export default function ListItem(props) {
  const { item, allChecked, onToggle, onRemove, onHide, onUpdateDescription } = props;
  const { t } = useTranslation();
  const done = item.is_done;

  // Auto-hide: once an item is checked off, the user has a short grace window
  // to uncheck (undo) before it's hidden automatically (it stays done in the
  // store — hiding is view-only, not a delete). The timer keys on `done` so
  // unchecking cancels it; onHide is read through a ref so the effect doesn't
  // reset on every parent re-render. Suppressed when every item is checked —
  // then the whole list auto-deletes (handled by ListCard), so items don't
  // each self-hide right before the list disappears.
  const hideRef = useRef(onHide);
  hideRef.current = onHide;
  useEffect(() => {
    if (!done || allChecked) return;
    const id = setTimeout(() => hideRef.current(), CHECKLIST_AUTO_HIDE_MS);
    return () => clearTimeout(id);
  }, [done, allChecked]);

  // Description editor: clicking the name opens an inline textarea seeded from
  // the item. Blur / Enter saves (only when changed), Escape cancels. Shift+Enter
  // inserts a newline.
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const openEditor = () => {
    setDraft(item.description);
    setEditing(true);
  };
  const saveDescription = () => {
    setEditing(false);
    const next = draft.trim();
    if (next !== item.description) onUpdateDescription(next);
  };

  return (
    <li className={done ? `${classes.item} ${classes.packing}` : classes.item}>
      <span
        className={done ? `${classes.chk} ${classes.done}` : classes.chk}
        onClick={onToggle}
      >
        {done ? "✓" : ""}
      </span>
      <div className={classes.body}>
        <span
          className={done ? `${classes.name} ${classes.crossed}` : classes.name}
          title={t("checklist.editDescription")}
          onClick={() => (editing ? saveDescription() : openEditor())}
        >
          {item.itemName}
        </span>
        {editing ? (
          <textarea
            className={classes.desc_input}
            value={draft}
            rows={2}
            placeholder={t("checklist.descriptionPlaceholder")}
            ref={(el) => el?.focus()}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveDescription}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                saveDescription();
              } else if (e.key === "Escape") {
                setEditing(false);
              }
            }}
          />
        ) : (
          item.description && <span className={classes.desc}>{linkify(item.description, classes.link)}</span>
        )}
      </div>
      <RemoveButton title={t("checklist.removeItem")} size="sm" onClick={onRemove} />
    </li>
  );
}