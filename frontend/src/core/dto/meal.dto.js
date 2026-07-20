import { Meal } from "../models/meal";

export class MealDTO {
  constructor({ id, date, recipe_id = null, label = "" } = {}) {
    this.id = id;
    this.date = date;
    this.recipeId = recipe_id;
    this.label = label;
  }

  toModel() {
    return new Meal({
      id: this.id,
      date: this.date,
      recipeId: this.recipeId,
      label: this.label,
    });
  }
}