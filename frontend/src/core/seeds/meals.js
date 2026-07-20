// Shared meal plan (SEED_MEALS). Lives in `core/seeds/` (like SEED_PERSONS,
// SEED_EVENTS, SEED_LISTS, SEED_RECIPES) because the dashboard's "today's dish"
// is a view over the same meals — it finds the meal whose date is today and
// resolves its recipe, so the dashboard must reference the real meal/recipe
// ids. Per-feature data otherwise still seeds in its own hook; this is the
// cross-feature reference-data exception, converging to a single backend fetch
// once it lands.

import { MealDTO } from "../dto/meal.dto";

export const SEED_MEALS = [
  new MealDTO({ id: 1, date: "2026-07-20", recipe_id: 1, label: "" }).toModel(),
  new MealDTO({ id: 2, date: "2026-07-21", recipe_id: 2, label: "" }).toModel(),
  new MealDTO({ id: 3, date: "2026-07-22", recipe_id: null, label: "Leftovers" }).toModel(),
];