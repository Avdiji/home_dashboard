import { formatDate } from "../../../core/utils/date_utils";
import classes from "./meal_row.module.css";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MealRow({ meal, recipe, onOpenRecipe, onRemove }) {
  const dish = recipe ? recipe.title : meal.label;
  const weekday = WEEKDAYS[new Date(`${meal.date}T00:00:00`).getDay()];

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
          title="Open recipe"
        >
          {dish}
        </button>
      ) : (
        <span className={classes.dish}>{dish}</span>
      )}
      <span className={classes.remove} title="Remove dish" onClick={onRemove}>
        ✕
      </span>
    </li>
  );
}