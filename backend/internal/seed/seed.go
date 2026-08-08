// Package seed inserts the same roster/events/checklists/recipes/meals the
// frontend seeds in core/seeds/*, but only into an empty table (idempotent).
// This keeps the dashboard identical whether the frontend reads its seeds or
// swaps them for the backend fetch. Events use dates relative to "now" (mirrors
// the frontend's runtime `at(day,h,m)` helper); meals use the frontend's fixed
// dates verbatim.
package seed

import (
	"time"

	"homedashboard/internal/model"
	"homedashboard/internal/store"
)

// Run seeds every empty entity table. Each table is gated by its own row count,
// so seeding never clobbers existing data (and survives partial deletions).
func Run(s *store.Store) error {
	if empty(s, "persons") {
		if err := seedPersons(s); err != nil {
			return err
		}
	}
	if empty(s, "events") {
		if err := seedEvents(s); err != nil {
			return err
		}
	}
	if empty(s, "checklists") {
		if err := seedChecklists(s); err != nil {
			return err
		}
	}
	if empty(s, "recipes") {
		if err := seedRecipes(s); err != nil {
			return err
		}
	}
	if empty(s, "meals") {
		if err := seedMeals(s); err != nil {
			return err
		}
	}
	return nil
}

func empty(s *store.Store, table string) bool {
	var n int
	_ = s.DB().QueryRow("SELECT count(*) FROM " + table).Scan(&n) // table names are compile-time literals
	return n == 0
}

func seedPersons(s *store.Store) error {
	roster := []struct {
		name     string
		birthday string
	}{
		{"Anna", "1992-08-12"},
		{"Mark", "1988-04-23"},
		{"Lena", "1998-07-25"},
	}
	for _, p := range roster {
		b := p.birthday
		if _, err := s.CreatePerson(p.name, &b); err != nil {
			return err
		}
	}
	return nil
}

func seedEvents(s *store.Store) error {
	type seed struct {
		title, desc, loc string
		startDay, startH, startM int
		endDay, endH, endM       int
		persons                  []int
		freq                     string
	}
	events := []seed{
		{"Dentist Anna", "Checkup at Dr. Müller.", "Zahnarzt Praxis", 0, 9, 0, 0, 10, 0, []int{1}, "none"},
		{"Morning standup", "", "Office", -30, 8, 0, -30, 8, 30, []int{}, "daily"},
		{"Football practice", "Don't forget shin pads.", "Sportplatz", 1, 17, 0, 1, 18, 30, []int{2, 3}, "weekly"},
		{"Pay rent", "", "", 5, 0, 0, 5, 0, 1, []int{2}, "monthly"},
		{"Lunch with Mark", "Try the new place.", "Café Sol", 2, 12, 0, 2, 13, 0, []int{2}, "none"},
		{"School pickup", "", "Grundschule Nord", -60, 14, 30, -60, 15, 0, []int{1, 3}, "weekly"},
	}
	for _, e := range events {
		ev := &model.Event{
			Title:       e.title,
			Description: e.desc,
			Location:    e.loc,
			StartAt:     at(e.startDay, e.startH, e.startM),
			EndAt:       at(e.endDay, e.endH, e.endM),
			PersonIDs:   e.persons,
			Frequency:   e.freq,
		}
		if _, err := s.CreateEvent(ev); err != nil {
			return err
		}
	}
	return nil
}

func seedChecklists(s *store.Store) error {
	type item struct {
		name string
		done bool
	}
	type list struct {
		title   string
		persons []int
		items   []item
	}
	lists := []list{
		{"Groceries", []int{}, []item{
			{"Milk", true}, {"Bread", false}, {"Eggs", false}, {"Pasta", false}, {"Tomatoes", false},
		}},
		{"Hardware store", []int{2}, []item{
			{"Screws M4", false}, {"Paintbrush", false},
		}},
		{"Edeka", []int{1, 3}, []item{
			{"Mie Noodles", false}, {"Tomatoes", true},
		}},
		{"Fitor", []int{1, 3}, []item{
			{"Mie Noodles", false}, {"Tomatoes", true},
		}},
		{"Fortesa", []int{1, 3}, []item{
			{"Mie Noodles", false}, {"Tomatoes", true},
		}},
		// NOTE: the frontend SEED_LISTS has a duplicate id=4 (Fitor + Fortesa).
		// SQLite AUTOINCREMENT gives each a unique id — the dashboard deep-link
		// ids still line up because the frontend also resolves by id at runtime.
	}
	for _, l := range lists {
		c, err := s.CreateList(l.title, l.persons)
		if err != nil {
			return err
		}
		for _, it := range l.items {
			item, err := s.AddItem(c.ID, it.name)
			if err != nil {
				return err
			}
			if it.done {
				if _, err := s.ToggleItem(c.ID, item.ID); err != nil {
					return err
				}
			}
		}
	}
	return nil
}

func seedRecipes(s *store.Store) error {
	recipes := []model.Recipe{
		{Title: "Pasta Pomodoro", Description: "Quick weeknight pasta.",
			Ingredients: []string{"400g pasta", "1 can tomatoes", "garlic", "basil", "olive oil"},
			Servings:    iptr(4), Minutes: iptr(25)},
		{Title: "Veggie Stir-fry", Description: "Flexible — use whatever is in the fridge.",
			Ingredients: []string{"mixed veg", "soy sauce", "garlic", "ginger", "rice"},
			Servings:    iptr(2), Minutes: iptr(20)},
		{Title: "Overnight Oats", Description: "Prep the night before.",
			Ingredients: []string{"oats", "milk", "yogurt", "berries", "honey"},
			Servings:    iptr(1), Minutes: iptr(5)},
	}
	for _, r := range recipes {
		if _, err := s.CreateRecipe(&r); err != nil {
			return err
		}
	}
	return nil
}

func seedMeals(s *store.Store) error {
	meals := []struct {
		date     string
		recipeID *int
		label    string
	}{
		{"2026-07-20", iptr(1), ""},
		{"2026-07-21", iptr(2), ""},
		{"2026-07-22", nil, "Leftovers"},
	}
	for _, m := range meals {
		if _, err := s.CreateMeal(&model.Meal{Date: m.date, RecipeID: m.recipeID, Label: m.label}); err != nil {
			return err
		}
	}
	return nil
}

// at mirrors the frontend seed helper `at(day, h, m)`: today at h:m, shifted by
// day. Returns RFC 3339 so the EventDTO's new Date(start_at) parses cleanly.
func at(day, h, m int) string {
	now := time.Now()
	t := time.Date(now.Year(), now.Month(), now.Day(), h, m, 0, 0, now.Location()).AddDate(0, 0, day)
	return t.Format(time.RFC3339)
}

func iptr(v int) *int { return &v }