import { useState } from "react";
import classes from "./recipe_form.module.css";

export default function RecipeForm({ recipe = null, onClose, onSave, onUpdate, onDelete }) {
  const [title, setTitle] = useState(recipe?.title ?? "");
  const [description, setDescription] = useState(recipe?.description ?? "");
  const [ingredients, setIngredients] = useState((recipe?.ingredients ?? []).join("\n"));
  const [servings, setServings] = useState(recipe?.servings ?? 0);
  const [minutes, setMinutes] = useState(recipe?.minutes ?? 0);

  const payload = () => ({
    title: title.trim(),
    description: description.trim(),
    ingredients: ingredients
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    servings: Number(servings) || 0,
    minutes: Number(minutes) || 0,
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
    <div className={classes.overlay} onClick={onClose}>
      <div className={classes.dialog} onClick={(e) => e.stopPropagation()}>
        <h2 className={classes.title}>{recipe ? "Edit recipe" : "New recipe"}</h2>

        <label className={classes.row}>
          <span className={classes.lbl}>Title</span>
          <input
            className={classes.input}
            value={title}
            placeholder="Recipe name"
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <div className={`${classes.meta} ${classes.gap_above}`}>
          <label className={classes.row}>
            <span className={classes.lbl}>Servings</span>
            <input
              type="number"
              min="0"
              className={classes.input}
              value={servings}
              onChange={(e) => setServings(e.target.value)}
            />
          </label>
          <label className={classes.row}>
            <span className={classes.lbl}>Minutes</span>
            <input
              type="number"
              min="0"
              className={classes.input}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </label>
        </div>

        <label className={`${classes.row} ${classes.col} ${classes.gap_above}`}>
          <span className={classes.lbl}>Description</span>
          <textarea
            className={classes.textarea}
            value={description}
            placeholder="Optional"
            rows={2}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label className={`${classes.row} ${classes.col}`}>
          <span className={classes.lbl}>Ingredients</span>
          <textarea
            className={classes.textarea}
            value={ingredients}
            placeholder="One per line"
            rows={5}
            onChange={(e) => setIngredients(e.target.value)}
          />
        </label>

        <div className={classes.actions}>
          {recipe && (
            <button type="button" className={classes.delete} onClick={remove}>
              Delete
            </button>
          )}
          <div className={classes.actions_right}>
            <button type="button" className={classes.cancel} onClick={onClose}>Cancel</button>
            <button type="button" className={classes.save} onClick={submit} disabled={!title.trim()}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}