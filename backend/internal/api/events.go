package api

import (
	"encoding/json"

	"homedashboard/internal/model"
)

// Event is the server→client broadcast envelope (docs/asyncapi.yaml
// `eventEnvelope`). ListID is only set for checklist_item events. Data is the
// full entity for created/updated, or nil for deleted. RequestID echoes the
// originating command's id when present.
type Event struct {
	Type      string          `json:"type"`       // "<entity>.<created|updated|deleted>"
	Entity    string          `json:"entity"`     // person|event|checklist|checklist_item|recipe|meal
	ID        int             `json:"id"`
	ListID    *int            `json:"listId,omitempty"`
	RequestID string          `json:"requestId,omitempty"`
	Data      json.RawMessage `json:"data"`
}

func mustJSON(v any) json.RawMessage {
	b, err := json.Marshal(v)
	if err != nil {
		return json.RawMessage("null")
	}
	return b
}

// --- builders: one per broadcast type. ---

func personCreated(p *model.Person, reqID string) *Event {
	return &Event{Type: "person.created", Entity: "person", ID: p.ID, RequestID: reqID, Data: mustJSON(p)}
}
func personUpdated(p *model.Person, reqID string) *Event {
	return &Event{Type: "person.updated", Entity: "person", ID: p.ID, RequestID: reqID, Data: mustJSON(p)}
}
func personDeleted(id int, reqID string) *Event {
	return &Event{Type: "person.deleted", Entity: "person", ID: id, RequestID: reqID, Data: json.RawMessage("null")}
}

func eventCreated(e *model.Event, reqID string) *Event {
	return &Event{Type: "event.created", Entity: "event", ID: e.ID, RequestID: reqID, Data: mustJSON(e)}
}
func eventUpdated(e *model.Event, reqID string) *Event {
	return &Event{Type: "event.updated", Entity: "event", ID: e.ID, RequestID: reqID, Data: mustJSON(e)}
}
func eventDeleted(id int, reqID string) *Event {
	return &Event{Type: "event.deleted", Entity: "event", ID: id, RequestID: reqID, Data: json.RawMessage("null")}
}

func checklistCreated(c *model.Checklist, reqID string) *Event {
	return &Event{Type: "checklist.created", Entity: "checklist", ID: c.ID, RequestID: reqID, Data: mustJSON(c)}
}
func checklistUpdated(c *model.Checklist, reqID string) *Event {
	return &Event{Type: "checklist.updated", Entity: "checklist", ID: c.ID, RequestID: reqID, Data: mustJSON(c)}
}
func checklistDeleted(id int, reqID string) *Event {
	return &Event{Type: "checklist.deleted", Entity: "checklist", ID: id, RequestID: reqID, Data: json.RawMessage("null")}
}

func itemCreated(listID int, it *model.ChecklistItem, reqID string) *Event {
	lid := listID
	return &Event{Type: "checklist_item.created", Entity: "checklist_item", ID: it.ID, ListID: &lid, RequestID: reqID, Data: mustJSON(it)}
}
func itemUpdated(listID int, it *model.ChecklistItem, reqID string) *Event {
	lid := listID
	return &Event{Type: "checklist_item.updated", Entity: "checklist_item", ID: it.ID, ListID: &lid, RequestID: reqID, Data: mustJSON(it)}
}
func itemDeleted(listID, itemID int, reqID string) *Event {
	lid := listID
	return &Event{Type: "checklist_item.deleted", Entity: "checklist_item", ID: itemID, ListID: &lid, RequestID: reqID, Data: json.RawMessage("null")}
}

func recipeCreated(r *model.Recipe, reqID string) *Event {
	return &Event{Type: "recipe.created", Entity: "recipe", ID: r.ID, RequestID: reqID, Data: mustJSON(r)}
}
func recipeUpdated(r *model.Recipe, reqID string) *Event {
	return &Event{Type: "recipe.updated", Entity: "recipe", ID: r.ID, RequestID: reqID, Data: mustJSON(r)}
}
func recipeDeleted(id int, reqID string) *Event {
	return &Event{Type: "recipe.deleted", Entity: "recipe", ID: id, RequestID: reqID, Data: json.RawMessage("null")}
}

func mealCreated(m *model.Meal, reqID string) *Event {
	return &Event{Type: "meal.created", Entity: "meal", ID: m.ID, RequestID: reqID, Data: mustJSON(m)}
}
func mealDeleted(id int, reqID string) *Event {
	return &Event{Type: "meal.deleted", Entity: "meal", ID: id, RequestID: reqID, Data: json.RawMessage("null")}
}

// marshalEvent wraps an Event envelope as a broadcast-ready JSON message.
func marshalEvent(e *Event) []byte {
	b, err := json.Marshal(e)
	if err != nil {
		return nil
	}
	return b
}

// errorMsg is the out-of-spec (but pragmatic) message sent back to the
// originating client when its command fails validation or persistence. It is
// NOT broadcast to other clients.
type errorMsg struct {
	Type      string `json:"type"` // "error"
	Action    string `json:"action"`
	RequestID string `json:"requestId,omitempty"`
	Error     string `json:"error"`
}

func marshalError(action, reqID, msg string) []byte {
	b, _ := json.Marshal(errorMsg{Type: "error", Action: action, RequestID: reqID, Error: msg})
	return b
}