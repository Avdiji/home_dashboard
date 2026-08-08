package model

// Recipe mirrors the `Recipe` entity (RecipeDTO). Servings/minutes are *int so
// they marshal as null when unset (spec: nullable).
type Recipe struct {
	ID          int      `json:"id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Ingredients []string `json:"ingredients"`
	Servings    *int     `json:"servings"`
	Minutes     *int     `json:"minutes"`
}