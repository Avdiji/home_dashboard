import Card from "../../../components/cards/card";
import classes from "./dish_card.module.css";

export default function DishCard({ dish }) {
  return (
    <Card title="Today's dish">
      {dish ? (
        <div>
          <div className={classes.name}>{dish.label}</div>
          {dish.recipe?.description && (
            <div className={classes.desc}>{dish.recipe.description}</div>
          )}
        </div>
      ) : (
        <div className={classes.empty}>Nothing planned today</div>
      )}
    </Card>
  );
}