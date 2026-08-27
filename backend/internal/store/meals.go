package store

import (
	"database/sql"

	"homedashboard/internal/model"
)

// CreateMeal backs meal.add (addMeal({ date, recipe_id, label })). A meal links
// to a recipe (recipe_id set) or is free-text (label only). A recipe is not
// mandatory; there is no meal.update — change = delete + add.
func (s *Store) CreateMeal(m *model.Meal) (*model.Meal, error) {
	res, err := s.db.Exec(`INSERT INTO meals (date, recipe_id, label) VALUES (?, ?, ?)`,
		m.Date, m.RecipeID, m.Label)
	if err != nil {
		return nil, err
	}
	id, _ := res.LastInsertId()
	return s.GetMeal(int(id))
}

// DeleteMeal backs meal.delete (removeMeal(mealId)).
func (s *Store) DeleteMeal(id int) (int, error) {
	_, err := s.db.Exec(`DELETE FROM meals WHERE id = ?`, id)
	return id, err
}

// GetMeal loads one meal.
func (s *Store) GetMeal(id int) (*model.Meal, error) {
	m := &model.Meal{}
	var recipeID sql.NullInt64
	err := s.db.QueryRow(`SELECT id, date, recipe_id, label FROM meals WHERE id = ?`, id).
		Scan(&m.ID, &m.Date, &recipeID, &m.Label)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	if recipeID.Valid {
		v := int(recipeID.Int64)
		m.RecipeID = &v
	}
	return m, nil
}

// ListMeals loads all meals, sorted by date asc (meal plan planned-dishes list).
func (s *Store) ListMeals() ([]model.Meal, error) {
	rows, err := s.db.Query(`SELECT id, date, recipe_id, label FROM meals ORDER BY date ASC, id ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []model.Meal
	for rows.Next() {
		var m model.Meal
		var recipeID sql.NullInt64
		if err := rows.Scan(&m.ID, &m.Date, &recipeID, &m.Label); err != nil {
			return nil, err
		}
		if recipeID.Valid {
			v := int(recipeID.Int64)
			m.RecipeID = &v
		}
		out = append(out, m)
	}
	return out, rows.Err()
}