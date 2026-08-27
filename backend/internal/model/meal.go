package model

// Meal mirrors the `Meal` entity (MealDTO). RecipeID is *int so it marshals as
// null for a free-text dish (spec: nullable). date is ISO "YYYY-MM-DD".
type Meal struct {
	ID       int     `json:"id"`
	Date     string  `json:"date"`
	RecipeID *int    `json:"recipe_id"`
	Label    string  `json:"label"`
}