import { useTranslation } from "react-i18next";
import PageHeader from "../../components/page_header/page_header";
import AddButton from "../../components/buttons/add_button";
import SegmentedControl from "../../components/segmented_control/segmented_control";
import layout from "../../components/layout/layout.module.css";
import RecipeCard from "./components/recipe_card";
import MealRow from "./components/meal_row";
import RecipeForm from "./components/recipe_form";
import MealForm from "./components/meal_form";
import useMealPlan from "./hooks/use_meal_plan";
import { TAB_PLANNED, TAB_RECIPES } from "../../core/constants";
import classes from "./meal_plan.module.css";

const TABS = [
  { key: TAB_PLANNED, labelKey: "mealPlan.plannedDishes", value: TAB_PLANNED },
  { key: TAB_RECIPES, labelKey: "mealPlan.recipes", value: TAB_RECIPES },
];

export default function MealPlan() {
  const { t } = useTranslation();
  const {
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
  } = useMealPlan();

  return (
    <div className={classes.view}>
      <PageHeader title={t("mealPlan.title")} subtitle={t("mealPlan.subtitle")} />

      <div className={classes.toolbar}>
        <SegmentedControl
          items={TABS.map((tab) => ({ key: tab.key, label: t(tab.labelKey), value: tab.value }))}
          value={tab}
          onChange={setTab}
        />
        <div className={classes.toolbar_right}>
          {tab === TAB_RECIPES ? (
            <AddButton onClick={openNewRecipe}>{t("mealPlan.newRecipe")}</AddButton>
          ) : (
            <AddButton onClick={() => openNewMeal()}>
              {t("mealPlan.planDish")}
            </AddButton>
          )}
        </div>
      </div>

      {tab === TAB_RECIPES ? (
        <section className={classes.block}>
          <div className={layout.twoColGrid}>
            {recipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} onOpen={() => openEditRecipe(r)} />
            ))}
          </div>
        </section>
      ) : (
        <section className={classes.block}>
          <ul className={classes.meals}>
            {mealsByDate.map((m) => (
              <MealRow
                key={m.id}
                meal={m}
                recipe={m.recipeId != null ? recipeById.get(m.recipeId) : null}
                onOpenRecipe={openEditRecipe}
                onRemove={() => removeMeal(m.id)}
              />
            ))}
          </ul>
        </section>
      )}

      {recipeFormOpen && (
        <RecipeForm
          recipe={editingRecipe}
          onClose={closeRecipeForm}
          onSave={addRecipe}
          onUpdate={updateRecipe}
          onDelete={removeRecipe}
        />
      )}
      {mealFormOpen && (
        <MealForm
          recipes={recipes}
          initialDate={mealFormDate}
          onClose={closeMealForm}
          onSave={addMeal}
        />
      )}
    </div>
  );
}