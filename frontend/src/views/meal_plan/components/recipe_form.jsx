import { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../../../components/modal/modal";
import controls from "../../../components/forms/form_controls.module.css";
import classes from "./recipe_form.module.css";

export default function RecipeForm({ recipe = null, onClose, onSave, onUpdate, onDelete }) {
  const { t } = useTranslation();
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
      title={recipe ? t("mealPlan.editRecipe") : t("mealPlan.newRecipeTitle")}
      onClose={onClose}
      onSave={submit}
      saveDisabled={!title.trim()}
      onDelete={recipe ? remove : null}
    >
      <label className={controls.row}>
        <span className={controls.lbl}>{t("mealPlan.titleLabel")}</span>
        <input
          className={controls.input}
          value={title}
          placeholder={t("mealPlan.recipeNamePlaceholder")}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <div className={`${classes.meta} ${controls.gap_above}`}>
        <label className={controls.row}>
          <span className={controls.lbl}>{t("mealPlan.servingsLabel")}</span>
          <input
            type="number"
            min="0"
            className={controls.input}
            value={servings}
            placeholder={t("common.optional")}
            onChange={(e) => setServings(e.target.value)}
          />
        </label>
        <label className={controls.row}>
          <span className={controls.lbl}>{t("mealPlan.minutesLabel")}</span>
          <input
            type="number"
            min="0"
            className={controls.input}
            value={minutes}
            placeholder={t("common.optional")}
            onChange={(e) => setMinutes(e.target.value)}
          />
        </label>
      </div>

      <label className={`${controls.row} ${controls.col} ${controls.gap_above}`}>
        <span className={controls.lbl}>{t("mealPlan.descriptionLabel")}</span>
        <textarea
          className={controls.textarea}
          value={description}
          placeholder={t("common.optional")}
          rows={2}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <label className={`${controls.row} ${controls.col}`}>
        <span className={controls.lbl}>{t("mealPlan.ingredientsLabel")}</span>
        <textarea
          className={controls.textarea}
          value={ingredients}
          placeholder={t("mealPlan.onePerLine")}
          rows={5}
          onChange={(e) => setIngredients(e.target.value)}
        />
      </label>
    </Modal>
  );
}