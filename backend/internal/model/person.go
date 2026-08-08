package model

// Person mirrors the `Person` entity in docs/asyncapi.yaml and the frontend
// PersonDTO. snake_case JSON tags match the backend shape the DTO parses.
// Birthday is a *string so it marshals as `null` when unset (spec: nullable),
// matching `birthday: { format: date, nullable: true }`.
type Person struct {
	ID       int     `json:"id"`
	Name     string  `json:"name"`
	Birthday *string `json:"birthday"`
}