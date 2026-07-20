export class Recipe {
  constructor({ id, title = "", description = "", ingredients = [], servings = null, minutes = null } = {}) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.ingredients = ingredients.slice();
    this.servings = servings;
    this.minutes = minutes;
  }
}