import { useState } from "react";
import classes from "./meal_form.module.css";

const today = () => new Date().toISOString().slice(0, 10);

export default function MealForm({ recipes = [], initialDate = null, onClose, onSave }) {
  const [date, setDate] = useState(initialDate ?? today());
  const [recipeId, setRecipeId] = useState("");
  const [label, setLabel] = useState("");

  const submit = () => {
    const rid = recipeId ? Number(recipeId) : null;
    if (!rid && !label.trim()) return;
    onSave?.({ date, recipeId: rid, label: label.trim() });
    onClose();
  };

  return (
    <div className={classes.overlay} onClick={onClose}>
      <div className={classes.dialog} onClick={(e) => e.stopPropagation()}>
        <h2 className={classes.title}>Plan a dish</h2>

        <label className={classes.row}>
          <span className={classes.lbl}>Date</span>
          <input
            type="date"
            className={classes.input}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <label className={classes.row}>
          <span className={classes.lbl}>Recipe</span>
          <select
            className={classes.select}
            value={recipeId}
            onChange={(e) => setRecipeId(e.target.value)}
          >
            <option value="">— None —</option>
            {recipes.map((r) => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </label>

        <label className={`${classes.row} ${classes.col} ${classes.gap_above}`}>
          <span className={classes.lbl}>Label</span>
          <input
            className={classes.input}
            value={label}
            placeholder="If no recipe, name the dish"
            onChange={(e) => setLabel(e.target.value)}
            disabled={!!recipeId}
          />
        </label>

        <div className={classes.actions}>
          <div className={classes.actions_right}>
            <button type="button" className={classes.cancel} onClick={onClose}>Cancel</button>
            <button
              type="button"
              className={classes.save}
              onClick={submit}
              disabled={!recipeId && !label.trim()}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}