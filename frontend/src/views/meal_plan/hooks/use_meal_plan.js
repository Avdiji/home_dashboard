import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RecipeDTO } from "../../../core/dto/recipe.dto";
import { MealDTO } from "../../../core/dto/meal.dto";
import { MEAL_PLAN_PATH } from "../../../core/nav_config";

const SEED_RECIPES = [
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

const SEED_MEALS = [
  new MealDTO({ id: 1, date: "2026-07-20", recipe_id: 1, label: "" }).toModel(),
  new MealDTO({ id: 2, date: "2026-07-21", recipe_id: 2, label: "" }).toModel(),
  new MealDTO({ id: 3, date: "2026-07-22", recipe_id: null, label: "Leftovers" }).toModel(),
];

export default function useMealPlan() {
  const [recipes] = useState(SEED_RECIPES);
  const [meals] = useState(SEED_MEALS);

  const [tab, setTab] = useState("planned");

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
    const editRecipeId = location.state?.editRecipeId;
    if (editRecipeId == null) return;
    const found = recipes.find((r) => r.id === editRecipeId);
    if (found) {
      setEditingRecipe(found);
      setRecipeFormOpen(true);
    }
    navigate(MEAL_PLAN_PATH, { replace: true, state: null });
  }, [location.state, recipes, navigate]);

  // noop — add recipe wiring handled once backend lands
  const addRecipe = ({ title, description, ingredients, servings, minutes }) => {};
  // noop — update recipe wiring handled once backend lands
  const updateRecipe = (recipeId, { title, description, ingredients, servings, minutes }) => {};
  // noop — remove recipe wiring handled once backend lands
  const removeRecipe = (recipeId) => {};
  // noop — add meal wiring handled once backend lands
  const addMeal = ({ date, recipeId, label }) => {};
  // noop — remove meal wiring handled once backend lands
  const removeMeal = (mealId) => {};

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