package model

// Event mirrors the `Event` entity in docs/asyncapi.yaml and the frontend
// EventDTO. start_at/end_at are ISO 8601 / RFC 3339 strings; person_ids carries
// the assigned person ids (junction table in the DB, array on the wire).
type Event struct {
	ID         int    `json:"id"`
	Title      string `json:"title"`
	Description string `json:"description"`
	Location    string `json:"location"`
	StartAt    string `json:"start_at"`
	EndAt      string `json:"end_at"`
	PersonIDs  []int  `json:"person_ids"`
	Frequency  string `json:"frequency"`
}