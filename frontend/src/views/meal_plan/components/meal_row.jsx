import classes from "./meal_row.module.css";

export default function MealRow({ meal, recipe, onOpenRecipe, onRemove }) {
  const dish = recipe ? recipe.title : meal.label;

  return (
    <li className={classes.row}>
      <span className={classes.date}>{meal.date}</span>
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