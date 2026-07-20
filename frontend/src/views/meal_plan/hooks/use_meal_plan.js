import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecipes } from "../../../store/recipes_store";
import { useMeals } from "../../../store/meals_store";
import { MEAL_PLAN_PATH } from "../../../core/nav_config";
import { STATE_KEY_EDIT_RECIPE_ID, TAB_PLANNED } from "../../../core/constants";

export default function useMealPlan() {
  // Entity state lives in the centralized stores — the dashboard's "today's
  // dish" reads the same `meals`/`recipes`, so a meal plan mutation (once the
  // backend lands) propagates everywhere. Noop action signatures come from
  // the store.
  const recipes = useRecipes((s) => s.recipes);
  const meals = useMeals((s) => s.meals);
  const addRecipe = useRecipes((s) => s.addRecipe);
  const updateRecipe = useRecipes((s) => s.updateRecipe);
  const removeRecipe = useRecipes((s) => s.removeRecipe);
  const addMeal = useMeals((s) => s.addMeal);
  const removeMeal = useMeals((s) => s.removeMeal);

  const [tab, setTab] = useState(TAB_PLANNED);

  const [recipeFormOpen, setRecipeFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [mealFormOpen, setMealFormOpen] = useState(false);
  const [mealFormDate, setMealFormDate] = useState(null);

  const recipeById = useMemo(() => {
    const m = new Map();
    recipes.forEach((r) => m.set(r.id, r));
    return m;
  }, [recipes]);

  const mealsByDate = useMemo(
    () => [...meals].sort((a, b) => a.date.localeCompare(b.date)),
    [meals]
  );

  const openNewRecipe = () => {
    setEditingRecipe(null);
    setRecipeFormOpen(true);
  };
  const openEditRecipe = (recipe) => {
    setEditingRecipe(recipe);
    setRecipeFormOpen(true);
  };
  const closeRecipeForm = () => setRecipeFormOpen(false);

  const openNewMeal = (date = null) => {
    setMealFormDate(date);
    setMealFormOpen(true);
  };
  const closeMealForm = () => setMealFormOpen(false);

  // Cross-feature deep link: the dashboard's "today's dish" navigates here with
  // `{ editRecipeId }` to open that recipe's edit modal.
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const editRecipeId = location.state?.[STATE_KEY_EDIT_RECIPE_ID];
    if (editRecipeId == null) return;
    const found = recipes.find((r) => r.id === editRecipeId);
    if (found) {
      setEditingRecipe(found);
      setRecipeFormOpen(true);
    }
    navigate(MEAL_PLAN_PATH, { replace: true, state: null });
  }, [location.state, recipes, navigate]);

  return {
    recipes,
    mealsByDate,
    recipeById,
    tab,
    setTab,
    recipeFormOpen,
    editingRecipe,
    mealFormOpen,
    mealFormDate,
    openNewRecipe,
    openEditRecipe,
    closeRecipeForm,
    openNewMeal,
    closeMealForm,
    addRecipe,
    updateRecipe,
    removeRecipe,
    addMeal,
    removeMeal,
  };
}