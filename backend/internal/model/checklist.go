package model

// Checklist mirrors the `Checklist` entity (ChecklistDTO). person_ids come from
// a junction table; items is the nested item array.
type Checklist struct {
	ID        int              `json:"id"`
	Title     string           `json:"title"`
	PersonIDs []int            `json:"person_ids"`
	Items     []ChecklistItem  `json:"items"`
}

// ChecklistItem mirrors the `ChecklistItem` entity (ChecklistItemDTO).
//
// NOTE: the field name is `itemName` (camelCase), NOT `item_name`. This is
// preserved to match the frontend ChecklistItemDTO which reads it as-is.
// Fix the DTO + this schema + the `item_name` column mapping together if the
// contract is normalized to snake_case.
type ChecklistItem struct {
	ID      int    `json:"id"`
	ItemName string `json:"itemName"`
	IsDone  bool   `json:"is_done"`
}