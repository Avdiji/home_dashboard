import { useTranslation } from "react-i18next";
import Card from "../../../components/cards/card";
import classes from "./recipe_card.module.css";

export default function RecipeCard({ recipe, onOpen }) {
  const { t } = useTranslation();
  return (
    <button type="button" className={classes.card_button} onClick={onOpen}>
      <Card
        title={recipe.title}
        badge={recipe.minutes ? t("mealPlan.minutesBadge", { count: recipe.minutes }) : null}
      >
        {recipe.description && <p className={classes.desc}>{recipe.description}</p>}
        {recipe.ingredients.length > 0 && (
          <ul className={classes.ingredients}>
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className={classes.ingredient}>{ing}</li>
            ))}
          </ul>
        )}
      </Card>
    </button>
  );
}