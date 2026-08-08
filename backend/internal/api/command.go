package api

import (
	"encoding/json"
	"errors"

	"homedashboard/internal/model"
	"homedashboard/internal/store"
)

var errBadFrequency = errors.New("invalid frequency (expected none|daily|weekly|monthly)")

// command is the client→server envelope (docs/asyncapi.yaml command messages).
// Action names the noop; RequestID is the optional correlation id; Payload is
// the per-action body.
type command struct {
	Action    string          `json:"action"`
	RequestID string          `json:"requestId"`
	Payload   json.RawMessage `json:"payload"`
}

// Dispatcher owns command parsing + store mutation. It implements ws.DispatchFunc.
type Dispatcher struct {
	store *store.Store
}

func NewDispatcher(s *store.Store) *Dispatcher {
	return &Dispatcher{store: s}
}

// Dispatch parses one inbound message, runs the matching noop against the
// store, and returns the event messages to broadcast. A non-nil reply is sent
// only to the originating client (validation/persistence errors).
func (d *Dispatcher) Dispatch(raw []byte) (events [][]byte, reply []byte) {
	var cmd command
	if err := json.Unmarshal(raw, &cmd); err != nil {
		return nil, marshalError("", "", "invalid command JSON: "+err.Error())
	}
	if cmd.Action == "" {
		return nil, marshalError("", "", "missing action")
	}

	switch cmd.Action {
	// ---- persons ----
	case "person.add":
		return d.personAdd(cmd)
	case "person.update":
		return d.personUpdate(cmd)
	case "person.delete":
		return d.personDelete(cmd)

	// ---- events ----
	case "event.add":
		return d.eventAdd(cmd)
	case "event.update":
		return d.eventUpdate(cmd)
	case "event.delete":
		return d.eventDelete(cmd)

	// ---- checklists ----
	case "checklist.add":
		return d.checklistAdd(cmd)
	case "checklist.updateTitle":
		return d.checklistUpdateTitle(cmd)
	case "checklist.toggleAssignee":
		return d.checklistToggleAssignee(cmd)
	case "checklist.delete":
		return d.checklistDelete(cmd)
	case "checklist.item.add":
		return d.itemAdd(cmd)
	case "checklist.item.toggle":
		return d.itemToggle(cmd)
	case "checklist.item.delete":
		return d.itemDelete(cmd)

	// ---- recipes ----
	case "recipe.add":
		return d.recipeAdd(cmd)
	case "recipe.update":
		return d.recipeUpdate(cmd)
	case "recipe.delete":
		return d.recipeDelete(cmd)

	// ---- meals ----
	case "meal.add":
		return d.mealAdd(cmd)
	case "meal.delete":
		return d.mealDelete(cmd)

	default:
		return nil, marshalError(cmd.Action, cmd.RequestID, "unknown action: "+cmd.Action)
	}
}

func decode(cmd command, v any) (bool, []byte) {
	if len(cmd.Payload) == 0 {
		return false, marshalError(cmd.Action, cmd.RequestID, "missing payload")
	}
	if err := json.Unmarshal(cmd.Payload, v); err != nil {
		return false, marshalError(cmd.Action, cmd.RequestID, "invalid payload: "+err.Error())
	}
	return true, nil
}

// ===== persons =====

type personAddPayload struct {
	Name     string  `json:"name"`
	Birthday *string `json:"birthday"`
}

func (d *Dispatcher) personAdd(cmd command) ([][]byte, []byte) {
	var p personAddPayload
	if ok, err := decode(cmd, &p); !ok {
		return nil, err
	}
	if p.Name == "" {
		return nil, marshalError(cmd.Action, cmd.RequestID, "name is required")
	}
	person, err := d.store.CreatePerson(p.Name, p.Birthday)
	if err != nil {
		return nil, marshalError(cmd.Action, cmd.RequestID, "create person: "+err.Error())
	}
	return [][]byte{marshalEvent(personCreated(person, cmd.RequestID))}, nil
}

type personUpdatePayload struct {
	PersonID int     `json:"personId"`
	Name     string  `json:"name"`
	Birthday *string `json:"birthday"`
}

func (d *Dispatcher) personUpdate(cmd command) ([][]byte, []byte) {
	var p personUpdatePayload
	if ok, err := decode(cmd, &p); !ok {
		return nil, err
	}
	if p.Name == "" {
		return nil, marshalError(cmd.Action, cmd.RequestID, "name is required")
	}
	person, err := d.store.UpdatePerson(p.PersonID, p.Name, p.Birthday)
	if err != nil {
		return nil, marshalError(cmd.Action, cmd.RequestID, "update person: "+err.Error())
	}
	return [][]byte{marshalEvent(personUpdated(person, cmd.RequestID))}, nil
}

type personDeletePayload struct {
	PersonID int `json:"personId"`
}

func (d *Dispatcher) personDelete(cmd command) ([][]byte, []byte) {
	var p personDeletePayload
	if ok, err := decode(cmd, &p); !ok {
		return nil, err
	}
	id, err := d.store.DeletePerson(p.PersonID)
	if err != nil {
		return nil, marshalError(cmd.Action, cmd.RequestID, "delete person: "+err.Error())
	}
	return [][]byte{marshalEvent(personDeleted(id, cmd.RequestID))}, nil
}

// ===== events =====

type eventAddPayload struct {
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Location    string  `json:"location"`
	StartAt     string  `json:"start_at"`
	EndAt       string  `json:"end_at"`
	PersonIDs   []int   `json:"person_ids"`
	Frequency   *string `json:"frequency"`
}

func (d *Dispatcher) eventAdd(cmd command) ([][]byte, []byte) {
	var p eventAddPayload
	if ok, err := decode(cmd, &p); !ok {
		return nil, err
	}
	if p.Title == "" {
		return nil, marshalError(cmd.Action, cmd.RequestID, "title is required")
	}
	if p.StartAt == "" || p.EndAt == "" {
		return nil, marshalError(cmd.Action, cmd.RequestID, "start_at and end_at are required")
	}
	freq := "none"
	if p.Frequency != nil {
		freq = *p.Frequency
	}
	if err := validateFrequency(freq); err != nil {
		return nil, marshalError(cmd.Action, cmd.RequestID, err.Error())
	}
	ids := p.PersonIDs
	if ids == nil {
		ids = []int{}
	}
	e, err := d.store.CreateEvent(&model.Event{
		Title: p.Title, Description: p.Description, Location: p.Location,
		StartAt: p.StartAt, EndAt: p.EndAt, PersonIDs: ids, Frequency: freq,
	})
	if err != nil {
		return nil, marshalError(cmd.Action, cmd.RequestID, "create event: "+err.Error())
	}
	return [][]byte{marshalEvent(eventCreated(e, cmd.RequestID))}, nil
}

type eventUpdatePayload struct {
	EventID     int     `json:"eventId"`
	Title       *string `json:"title"`
	Description *string `json:"description"`
	Location    *string `json:"location"`
	StartAt     *string `json:"start_at"`
	EndAt       *string `json:"end_at"`
	PersonIDs   *[]int  `json:"person_ids"`
	Frequency   *string `json:"frequency"`
}

func (d *Dispatcher) eventUpdate(cmd command) ([][]byte, []byte) {
	var p eventUpdatePayload
	if ok, err := decode(cmd, &p); !ok {
		return nil, err
	}
	if p.Frequency != nil {
		if err := validateFrequency(*p.Frequency); err != nil {
			return nil, marshalError(cmd.Action, cmd.RequestID, err.Error())
		}
	}
	e, err := d.store.UpdateEvent(p.EventID, store.EventPatch{
		Title: p.Title, Description: p.Description, Location: p.Location,
		StartAt: p.StartAt, EndAt: p.EndAt, PersonIDs: p.PersonIDs, Frequency: p.Frequency,
	})
	if err != nil {
		return nil, marshalError(cmd.Action, cmd.RequestID, "update event: "+err.Error())
	}
	if e == nil {
		return nil, marshalError(cmd.Action, cmd.RequestID, "event not found")
	}
	return [][]byte{marshalEvent(eventUpdated(e, cmd.RequestID))}, nil
}

type eventDeletePayload struct {
	EventID int `json:"eventId"`
}

func (d *Dispatcher) eventDelete(cmd command) ([][]byte, []byte) {
	var p eventDeletePayload
	if ok, err := decode(cmd, &p); !ok {
		return nil, err
	}
	id, err := d.store.DeleteEvent(p.EventID)
	if err != nil {
		return nil, marshalError(cmd.Action, cmd.RequestID, "delete event: "+err.Error())
	}
	return [][]byte{marshalEvent(eventDeleted(id, cmd.RequestID))}, nil
}

// ===== checklists =====

type checklistAddPayload struct {
	Title     string `json:"title"`
	PersonIDs []int  `json:"person_ids"`
}

func (d *Dispatcher) checklistAdd(cmd command) ([][]byte, []byte) {
	var p checklistAddPayload
	if ok, err := decode(cmd, &p); !ok {
		return nil, err
	}
	if p.Title == "" {
		return nil, marshalError(cmd.Action, cmd.RequestID, "title is required")
	}
	ids := p.PersonIDs
	if ids == nil {
		ids = []int{}
	}
	c, err := d.store.CreateList(p.Title, ids)
	if err != nil {
		return nil, marshalError(cmd.Action, cmd.RequestID, "create list: "+err.Error())
	}
	return [][]byte{marshalEvent(checklistCreated(c, cmd.RequestID))}, nil
}

type checklistUpdateTitlePayload struct {
	ListID int    `json:"listId"`
	Title  string `json:"title"`
}

func (d *Dispatcher) checklistUpdateTitle(cmd command) ([][]byte, []byte) {
	var p checklistUpdateTitlePayload
	if ok, err := decode(cmd, &p); !ok {
		return nil, err
	}
	if p.Title == "" {
		return nil, marshalError(cmd.Action, cmd.RequestID, "title is required")
	}
	c, err := d.store.UpdateListTitle(p.ListID, p.Title)
	if err != nil {
		return nil, marshalError(cmd.Action, cmd.RequestID, "update title: "+err.Error())
	}
	return [][]byte{marshalEvent(checklistUpdated(c, cmd.RequestID))}, nil
}

type checklistToggleAssigneePayload struct {
	ListID   int `json:"listId"`
	PersonID int `json:"personId"`
}

func (d *Dispatcher) checklistToggleAssignee(cmd command) ([][]byte, []byte) {
	var p checklistToggleAssigneePayload
	if ok, err := decode(cmd, &p); !ok {
		return nil, err
	}
	c, err := d.store.ToggleListAssignee(p.ListID, p.PersonID)
	if err != nil {
		return nil, marshalError(cmd.Action, cmd.RequestID, "toggle assignee: "+err.Error())
	}
	return [][]byte{marshalEvent(checklistUpdated(c, cmd.RequestID))}, nil
}

type listIDPayload struct {
	ListID int `json:"listId"`
}

func (d *Dispatcher) checklistDelete(cmd command) ([][]byte, []byte) {
	var p listIDPayload
	if ok, err := decode(cmd, &p); !ok {
		return nil, err
	}
	id, err := d.store.DeleteList(p.ListID)
	if err != nil {
		return nil, marshalError(cmd.Action, cmd.RequestID, "delete list: "+err.Error())
	}
	return [][]byte{marshalEvent(checklistDeleted(id, cmd.RequestID))}, nil
}

type itemAddPayload struct {
	ListID int    `json:"listId"`
	Label  string `json:"label"`
}

func (d *Dispatcher) itemAdd(cmd command) ([][]byte, []byte) {
	var p itemAddPayload
	if ok, err := decode(cmd, &p); !ok {
		return nil, err
	}
	if p.Label == "" {
		return nil, marshalError(cmd.Action, cmd.RequestID, "label is required")
	}
	it, err := d.store.AddItem(p.ListID, p.Label)
	if err != nil {
		return nil, marshalError(cmd.Action, cmd.RequestID, "add item: "+err.Error())
	}
	return [][]byte{marshalEvent(itemCreated(p.ListID, it, cmd.RequestID))}, nil
}

type itemTogglePayload struct {
	ListID  int `json:"listId"`
	ItemID int `json:"itemId"`
}

func (d *Dispatcher) itemToggle(cmd command) ([][]byte, []byte) {
	var p itemTogglePayload
	if ok, err := decode(cmd, &p); !ok {
		return nil, err
	}
	it, err := d.store.ToggleItem(p.ListID, p.ItemID)
	if err != nil {
		return nil, marshalError(cmd.Action, cmd.RequestID, "toggle item: "+err.Error())
	}
	return [][]byte{marshalEvent(itemUpdated(p.ListID, it, cmd.RequestID))}, nil
}

type itemDeletePayload struct {
	ListID  int `json:"listId"`
	ItemID  int `json:"itemId"`
}

func (d *Dispatcher) itemDelete(cmd command) ([][]byte, []byte) {
	var p itemDeletePayload
	if ok, err := decode(cmd, &p); !ok {
		return nil, err
	}
	id, err := d.store.DeleteItem(p.ListID, p.ItemID)
	if err != nil {
		return nil, marshalError(cmd.Action, cmd.RequestID, "delete item: "+err.Error())
	}
	return [][]byte{marshalEvent(itemDeleted(p.ListID, id, cmd.RequestID))}, nil
}

// ===== recipes =====

type recipeAddPayload struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Ingredients []string `json:"ingredients"`
	Servings    *int     `json:"servings"`
	Minutes     *int     `json:"minutes"`
}

func (d *Dispatcher) recipeAdd(cmd command) ([][]byte, []byte) {
	var p recipeAddPayload
	if ok, err := decode(cmd, &p); !ok {
		return nil, err
	}
	if p.Title == "" {
		return nil, marshalError(cmd.Action, cmd.RequestID, "title is required")
	}
	ing := p.Ingredients
	if ing == nil {
		ing = []string{}
	}
	r, err := d.store.CreateRecipe(&model.Recipe{
		Title: p.Title, Description: p.Description, Ingredients: ing,
		Servings: p.Servings, Minutes: p.Minutes,
	})
	if err != nil {
		return nil, marshalError(cmd.Action, cmd.RequestID, "create recipe: "+err.Error())
	}
	return [][]byte{marshalEvent(recipeCreated(r, cmd.RequestID))}, nil
}

type recipeUpdatePayload struct {
	RecipeID    int      `json:"recipeId"`
	Title       *string  `json:"title"`
	Description *string  `json:"description"`
	Ingredients *[]string `json:"ingredients"`
	Servings    *int     `json:"servings"`
	Minutes     *int     `json:"minutes"`
}

func (d *Dispatcher) recipeUpdate(cmd command) ([][]byte, []byte) {
	var p recipeUpdatePayload
	if ok, err := decode(cmd, &p); !ok {
		return nil, err
	}
	r, err := d.store.UpdateRecipe(p.RecipeID, store.RecipePatch{
		Title: p.Title, Description: p.Description, Ingredients: p.Ingredients,
		Servings: p.Servings, Minutes: p.Minutes,
	})
	if err != nil {
		return nil, marshalError(cmd.Action, cmd.RequestID, "update recipe: "+err.Error())
	}
	return [][]byte{marshalEvent(recipeUpdated(r, cmd.RequestID))}, nil
}

type recipeDeletePayload struct {
	RecipeID int `json:"recipeId"`
}

func (d *Dispatcher) recipeDelete(cmd command) ([][]byte, []byte) {
	var p recipeDeletePayload
	if ok, err := decode(cmd, &p); !ok {
		return nil, err
	}
	id, err := d.store.DeleteRecipe(p.RecipeID)
	if err != nil {
		return nil, marshalError(cmd.Action, cmd.RequestID, "delete recipe: "+err.Error())
	}
	return [][]byte{marshalEvent(recipeDeleted(id, cmd.RequestID))}, nil
}

// ===== meals =====

type mealAddPayload struct {
	Date     string `json:"date"`
	RecipeID *int   `json:"recipe_id"`
	Label    string `json:"label"`
}

func (d *Dispatcher) mealAdd(cmd command) ([][]byte, []byte) {
	var p mealAddPayload
	if ok, err := decode(cmd, &p); !ok {
		return nil, err
	}
	if p.Date == "" {
		return nil, marshalError(cmd.Action, cmd.RequestID, "date is required")
	}
	if p.RecipeID == nil && p.Label == "" {
		return nil, marshalError(cmd.Action, cmd.RequestID, "recipe_id or label is required")
	}
	m, err := d.store.CreateMeal(&model.Meal{Date: p.Date, RecipeID: p.RecipeID, Label: p.Label})
	if err != nil {
		return nil, marshalError(cmd.Action, cmd.RequestID, "create meal: "+err.Error())
	}
	return [][]byte{marshalEvent(mealCreated(m, cmd.RequestID))}, nil
}

type mealDeletePayload struct {
	MealID int `json:"mealId"`
}

func (d *Dispatcher) mealDelete(cmd command) ([][]byte, []byte) {
	var p mealDeletePayload
	if ok, err := decode(cmd, &p); !ok {
		return nil, err
	}
	id, err := d.store.DeleteMeal(p.MealID)
	if err != nil {
		return nil, marshalError(cmd.Action, cmd.RequestID, "delete meal: "+err.Error())
	}
	return [][]byte{marshalEvent(mealDeleted(id, cmd.RequestID))}, nil
}

// ===== helpers =====

func validateFrequency(f string) error {
	switch f {
	case "none", "daily", "weekly", "monthly":
		return nil
	}
	return errBadFrequency
}