import { create } from "zustand";
import { SEED_MEALS } from "../core/seeds/meals";

// Centralized meal plan state (date-keyed dishes). Single source of truth
// shared by the meal plan (meal CRUD) and the dashboard (today's dish — finds
// the meal whose date is today and resolves its recipe). Module-level store —
// no provider needed; subscribe via `useMeals((s) => s.meals)`.
//
// Seeds still define the initial state; swap for a fetch once the backend
// lands. Mutations are noops with full signatures — the signature is the spec
// for the future backend call. Websocket wiring (later stage) calls these
// actions / set() on incoming meal pushes so every client updates.

export const useMeals = create(() => ({
  meals: SEED_MEALS,
  // noop — add meal wiring handled once backend lands
  addMeal: ({ date, recipeId, label }) => {},
  // noop — remove meal wiring handled once backend lands
  removeMeal: (mealId) => {},
}));