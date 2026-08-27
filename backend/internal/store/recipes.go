package store

import (
	"database/sql"

	"homedashboard/internal/model"
)

// RecipePatch is the partial-update payload for recipe.update. Pointer fields
// mean "this key was present"; nil leaves the column (matches
// updateRecipe(recipeId, { … })).
type RecipePatch struct {
	Title       *string
	Description *string
	Ingredients *[]string
	Servings    *int
	Minutes     *int
}

// CreateRecipe backs recipe.add (addRecipe({ title, description, ingredients,
// servings, minutes })).
func (s *Store) CreateRecipe(r *model.Recipe) (*model.Recipe, error) {
	res, err := s.db.Exec(`INSERT INTO recipes (title, description, ingredients, servings, minutes)
		VALUES (?, ?, ?, ?, ?)`,
		r.Title, r.Description, jsonStrings(r.Ingredients), r.Servings, r.Minutes)
	if err != nil {
		return nil, err
	}
	id, _ := res.LastInsertId()
	return s.GetRecipe(int(id))
}

// UpdateRecipe backs recipe.update. Only present patch keys are applied. For
// ingredients we pass a nil arg when the key is absent so COALESCE keeps the
// existing column (a *[]int can't be bound directly by the driver).
func (s *Store) UpdateRecipe(id int, p RecipePatch) (*model.Recipe, error) {
	var ingredientsArg interface{}
	if p.Ingredients != nil {
		ingredientsArg = jsonStrings(*p.Ingredients)
	}
	if _, err := s.db.Exec(`UPDATE recipes SET
		title = COALESCE(?, title),
		description = COALESCE(?, description),
		ingredients = COALESCE(?, ingredients),
		servings = COALESCE(?, servings),
		minutes = COALESCE(?, minutes)
		WHERE id = ?`,
		p.Title, p.Description,
		ingredientsArg,
		p.Servings, p.Minutes, id); err != nil {
		return nil, err
	}
	return s.GetRecipe(id)
}

// DeleteRecipe backs recipe.delete (removeRecipe(recipeId)). Meals referencing
// it get recipe_id NULLed (FK ON DELETE SET NULL).
func (s *Store) DeleteRecipe(id int) (int, error) {
	_, err := s.db.Exec(`DELETE FROM recipes WHERE id = ?`, id)
	return id, err
}

// GetRecipe loads one recipe.
func (s *Store) GetRecipe(id int) (*model.Recipe, error) {
	r := &model.Recipe{}
	var desc, ingr string
	var servings, minutes sql.NullInt64
	err := s.db.QueryRow(`SELECT id, title, description, ingredients, servings, minutes FROM recipes WHERE id = ?`, id).
		Scan(&r.ID, &r.Title, &desc, &ingr, &servings, &minutes)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	r.Description = desc
	r.Ingredients = parseStrings(ingr)
	if servings.Valid {
		v := int(servings.Int64)
		r.Servings = &v
	}
	if minutes.Valid {
		v := int(minutes.Int64)
		r.Minutes = &v
	}
	return r, nil
}

// ListRecipes loads all recipes (initial fetch + dashboard today's dish).
func (s *Store) ListRecipes() ([]model.Recipe, error) {
	rows, err := s.db.Query(`SELECT id, title, description, ingredients, servings, minutes FROM recipes ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []model.Recipe
	for rows.Next() {
		var r model.Recipe
		var desc, ingr string
		var servings, minutes sql.NullInt64
		if err := rows.Scan(&r.ID, &r.Title, &desc, &ingr, &servings, &minutes); err != nil {
			return nil, err
		}
		r.Description = desc
		r.Ingredients = parseStrings(ingr)
		if servings.Valid {
			v := int(servings.Int64)
			r.Servings = &v
		}
		if minutes.Valid {
			v := int(minutes.Int64)
			r.Minutes = &v
		}
		out = append(out, r)
	}
	return out, rows.Err()
}