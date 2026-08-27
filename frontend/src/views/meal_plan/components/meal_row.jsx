import { useTranslation } from "react-i18next";
import { formatDate, formatWeekdayShort } from "../../../core/utils/date_utils";
import RemoveButton from "../../../components/buttons/remove_button";
import classes from "./meal_row.module.css";

export default function MealRow({ meal, recipe, onOpenRecipe, onRemove }) {
  const { t } = useTranslation();
  const dish = recipe ? recipe.title : meal.label;
  const weekday = formatWeekdayShort(meal.date);

  return (
    <li className={classes.row}>
      <span className={classes.date}>
        <span className={classes.weekday}>{weekday}</span>
        <span className={classes.day}>{formatDate(meal.date)}</span>
      </span>
      {recipe ? (
        <button
          type="button"
          className={classes.link}
          onClick={() => onOpenRecipe(recipe)}
          title={t("mealPlan.openRecipe")}
        >
          {dish}
        </button>
      ) : (
        <span className={classes.dish}>{dish}</span>
      )}
      <RemoveButton
        title={t("mealPlan.removeDish")}
        size="sm"
        className={classes.removeWrap}
        onClick={onRemove}
      />
    </li>
  );
}