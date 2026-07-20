import { useState } from "react";
import Modal from "../../../components/modal/modal";
import controls from "../../../components/forms/form_controls.module.css";

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
    <Modal
      title="Plan a dish"
      onClose={onClose}
      onSave={submit}
      saveDisabled={!recipeId && !label.trim()}
    >
      <label className={controls.row}>
        <span className={controls.lbl}>Date</span>
        <input
          type="date"
          className={controls.input}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>

      <label className={controls.row}>
        <span className={controls.lbl}>Recipe</span>
        <select
          className={controls.select}
          value={recipeId}
          onChange={(e) => setRecipeId(e.target.value)}
        >
          <option value="">— None —</option>
          {recipes.map((r) => (
            <option key={r.id} value={r.id}>{r.title}</option>
          ))}
        </select>
      </label>

      <label className={`${controls.row} ${controls.col} ${controls.gap_above}`}>
        <span className={controls.lbl}>Label</span>
        <input
          className={controls.input}
          value={label}
          placeholder="If no recipe, name the dish"
          onChange={(e) => setLabel(e.target.value)}
          disabled={!!recipeId}
        />
      </label>
    </Modal>
  );
}