import { useState } from "react";
import Modal from "../../../components/modal/modal";
import controls from "../../../components/forms/form_controls.module.css";
import classes from "./recipe_form.module.css";

export default function RecipeForm({ recipe = null, onClose, onSave, onUpdate, onDelete }) {
  const [title, setTitle] = useState(recipe?.title ?? "");
  const [description, setDescription] = useState(recipe?.description ?? "");
  const [ingredients, setIngredients] = useState((recipe?.ingredients ?? []).join("\n"));
  const [servings, setServings] = useState(recipe?.servings ?? "");
  const [minutes, setMinutes] = useState(recipe?.minutes ?? "");

  const payload = () => ({
    title: title.trim(),
    description: description.trim(),
    ingredients: ingredients
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    servings: servings === "" ? null : Number(servings) || null,
    minutes: minutes === "" ? null : Number(minutes) || null,
  });

  const submit = () => {
    if (!title.trim()) return;
    if (recipe) onUpdate?.(recipe.id, payload());
    else onSave?.(payload());
    onClose();
  };

  const remove = () => {
    if (recipe) onDelete?.(recipe.id);
    onClose();
  };

  return (
    <Modal
      title={recipe ? "Edit recipe" : "New recipe"}
      onClose={onClose}
      onSave={submit}
      saveDisabled={!title.trim()}
      onDelete={recipe ? remove : null}
    >
      <label className={controls.row}>
        <span className={controls.lbl}>Title</span>
        <input
          className={controls.input}
          value={title}
          placeholder="Recipe name"
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <div className={`${classes.meta} ${controls.gap_above}`}>
        <label className={controls.row}>
          <span className={controls.lbl}>Servings</span>
          <input
            type="number"
            min="0"
            className={controls.input}
            value={servings}
            placeholder="Optional"
            onChange={(e) => setServings(e.target.value)}
          />
        </label>
        <label className={controls.row}>
          <span className={controls.lbl}>Minutes</span>
          <input
            type="number"
            min="0"
            className={controls.input}
            value={minutes}
            placeholder="Optional"
            onChange={(e) => setMinutes(e.target.value)}
          />
        </label>
      </div>

      <label className={`${controls.row} ${controls.col} ${controls.gap_above}`}>
        <span className={controls.lbl}>Description</span>
        <textarea
          className={controls.textarea}
          value={description}
          placeholder="Optional"
          rows={2}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <label className={`${controls.row} ${controls.col}`}>
        <span className={controls.lbl}>Ingredients</span>
        <textarea
          className={controls.textarea}
          value={ingredients}
          placeholder="One per line"
          rows={5}
          onChange={(e) => setIngredients(e.target.value)}
        />
      </label>
    </Modal>
  );
}