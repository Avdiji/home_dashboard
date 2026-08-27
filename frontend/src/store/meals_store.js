import { create } from "zustand";
import { sendCommand } from "../core/api/transport";

// Centralized meal plan state (date-keyed dishes). Single source of truth
// shared by the meal plan (meal CRUD) and the dashboard (today's dish — finds
// the meal whose date is today and resolves its recipe). Module-level store —
// no provider needed; subscribe via `useMeals((s) => s.meals)`.
//
// Initial state is empty; `loadAll()` hydrates from the backend on mount, and
// broadcast events keep it in sync (no optimistic local update — the broadcast
// round-trip updates every client via applyEvent). The action signature stays
// the spec for the command payload.

export const useMeals = create(() => ({
  meals: [],
  // meal.add — { date, recipe_id, label } (recipe_id is null for a free-text dish)
  addMeal: ({ date, recipeId, label }) =>
    sendCommand("meal.add", { date, recipe_id: recipeId, label }),
  // meal.delete — { mealId }
  removeMeal: (mealId) =>
    sendCommand("meal.delete", { mealId }),
}));