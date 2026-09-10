import { useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "../../../components/cards/card";
import { RECIPE_INGREDIENTS_VISIBLE_LIMIT } from "../../../core/constants";
import classes from "./recipe_card.module.css";

export default function RecipeCard({ recipe, onOpen }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const hasMoreIngredients = recipe.ingredients.length > RECIPE_INGREDIENTS_VISIBLE_LIMIT;
  const visibleIngredients = expanded
    ? recipe.ingredients
    : recipe.ingredients.slice(0, RECIPE_INGREDIENTS_VISIBLE_LIMIT);

  // The toggle is a real <button> nested inside the card's clickable area, so
  // the whole card can no longer be a <button> itself (buttons can't nest) —
  // it's a role="button" div with the same click/keyboard contract instead.
  const toggleIngredients = (e) => {
    e.stopPropagation();
    setExpanded((v) => !v);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={classes.card_button}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <Card
        title={recipe.title}
        badge={recipe.minutes ? t("mealPlan.minutesBadge", { count: recipe.minutes }) : null}
      >
        {recipe.description && <p className={classes.desc}>{recipe.description}</p>}
        {recipe.ingredients.length > 0 && (
          <>
            <ul className={classes.ingredients}>
              {visibleIngredients.map((ing, i) => (
                <li key={i} className={classes.ingredient}>{ing}</li>
              ))}
            </ul>
            {hasMoreIngredients && (
              <button type="button" className={classes.moreBtn} onClick={toggleIngredients}>
                {expanded
                  ? t("mealPlan.showLess")
                  : t("mealPlan.showMore", {
                      count: recipe.ingredients.length - RECIPE_INGREDIENTS_VISIBLE_LIMIT,
                    })}
              </button>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
