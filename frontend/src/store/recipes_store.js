import { create } from "zustand";
import { SEED_RECIPES } from "../core/seeds/recipes";

// Centralized recipe library state. Single source of truth shared by the meal
// plan (recipe CRUD) and the dashboard (today's dish resolves its recipe from
// here, so the click deep-link lands on the real recipe id). Module-level
// store — no provider needed; subscribe via `useRecipes((s) => s.recipes)`.
//
// Seeds still define the initial state; swap for a fetch once the backend
// lands. Mutations are noops with full signatures — the signature is the spec
// for the future backend call. Websocket wiring (later stage) calls these
// actions / set() on incoming recipe pushes so every client updates.

export const useRecipes = create(() => ({
  recipes: SEED_RECIPES,
  // noop — add recipe wiring handled once backend lands
  addRecipe: ({ title, description, ingredients, servings, minutes }) => {},
  // noop — update recipe wiring handled once backend lands
  updateRecipe: (recipeId, { title, description, ingredients, servings, minutes }) => {},
  // noop — remove recipe wiring handled once backend lands
  removeRecipe: (recipeId) => {},
}));