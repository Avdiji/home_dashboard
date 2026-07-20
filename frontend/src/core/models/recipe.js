export class Recipe {
  constructor({ id, title = "", description = "", ingredients = [], servings = 0, minutes = 0 } = {}) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.ingredients = ingredients.slice();
    this.servings = servings;
    this.minutes = minutes;
  }
}