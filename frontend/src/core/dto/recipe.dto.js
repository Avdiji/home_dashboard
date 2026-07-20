import { Recipe } from "../models/recipe";

export class RecipeDTO {
  constructor({ id, title, description, ingredients = [], servings, minutes } = {}) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.ingredients = Array.isArray(ingredients) ? ingredients.slice() : [];
    this.servings = servings;
    this.minutes = minutes;
  }

  toModel() {
    return new Recipe({
      id: this.id,
      title: this.title,
      description: this.description,
      ingredients: this.ingredients,
      servings: this.servings,
      minutes: this.minutes,
    });
  }
}