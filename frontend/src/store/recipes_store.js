import { create } from "zustand";
import { SEED_RECIPES } from "../core/seeds/recipes";
import { sendCommand } from "../core/api/transport";

// Centralized recipe library state. Single source of truth shared by the meal
// plan (recipe CRUD) and the dashboard (today's dish resolves its recipe from
// here, so the click deep-link lands on the real recipe id). Module-level
// store — no provider needed; subscribe via `useRecipes((s) => s.recipes)`.
//
// Seeds still define the initial state; `loadAll()` swaps them for the fetched
// recipes on mount. Mutations fire WS commands (no optimistic local update —
// the broadcast round-trip updates every client via applyEvent). The action
// signature stays the spec for the command payload. servings/minutes are
// numbers or null (the form already coerces empty → null).

export const useRecipes = create(() => ({
  recipes: SEED_RECIPES,
  // recipe.add — { title, description, ingredients, servings, minutes }
  addRecipe: ({ title, description, ingredients, servings, minutes }) =>
    sendCommand("recipe.add", {
      title,
      description,
      ingredients,
      servings,
      minutes,
    }),
  // recipe.update — full patch; backend pointers treat each field as "provided".
  updateRecipe: (recipeId, { title, description, ingredients, servings, minutes }) =>
    sendCommand("recipe.update", {
      recipeId,
      title,
      description,
      ingredients,
      servings,
      minutes,
    }),
  // recipe.delete — { recipeId }
  removeRecipe: (recipeId) =>
    sendCommand("recipe.delete", { recipeId }),
}));