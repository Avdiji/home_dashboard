export class Meal {
  constructor({ id, date = "", recipeId = null, label = "" } = {}) {
    this.id = id;
    this.date = date;
    this.recipeId = recipeId;
    this.label = label;
  }
}