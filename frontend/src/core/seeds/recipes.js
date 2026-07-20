// Shared recipe library (SEED_RECIPES). Lives in `core/seeds/` (like SEED_PERSONS,
// SEED_EVENTS, SEED_LISTS) because the dashboard's "today's dish" is a view over
// the same recipes — clicking it deep-links to the meal plan's recipe form, so
// the dashboard must reference the real recipe ids. Per-feature data otherwise
// still seeds in its own hook; this is the cross-feature reference-data
// exception, converging to a single backend fetch once it lands.

import { RecipeDTO } from "../dto/recipe.dto";

export const SEED_RECIPES = [
  new RecipeDTO({
    id: 1,
    title: "Pasta Pomodoro",
    description: "Quick weeknight pasta.",
    ingredients: ["400g pasta", "1 can tomatoes", "garlic", "basil", "olive oil"],
    servings: 4,
    minutes: 25,
  }).toModel(),
  new RecipeDTO({
    id: 2,
    title: "Veggie Stir-fry",
    description: "Flexible — use whatever is in the fridge.",
    ingredients: ["mixed veg", "soy sauce", "garlic", "ginger", "rice"],
    servings: 2,
    minutes: 20,
  }).toModel(),
  new RecipeDTO({
    id: 3,
    title: "Overnight Oats",
    description: "Prep the night before.",
    ingredients: ["oats", "milk", "yogurt", "berries", "honey"],
    servings: 1,
    minutes: 5,
  }).toModel(),
];