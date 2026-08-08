package store

import (
	"database/sql"

	"homedashboard/internal/model"
)

// CreateList backs checklist.add (addList({ title, person_ids })).
func (s *Store) CreateList(title string, personIDs []int) (*model.Checklist, error) {
	var created *model.Checklist
	err := s.tx(func(txn *sql.Tx) error {
		res, e := txn.Exec(`INSERT INTO checklists (title) VALUES (?)`, title)
		if e != nil {
			return e
		}
		id, _ := res.LastInsertId()
		if err := setIDs(txn, "checklists_persons", "list_id", int(id), personIDs); err != nil {
			return err
		}
		var err error
		created, err = scanList(txn, int(id))
		return err
	})
	return created, err
}

// UpdateListTitle backs checklist.updateTitle (updateTitle(listId, title)).
func (s *Store) UpdateListTitle(id int, title string) (*model.Checklist, error) {
	if _, err := s.db.Exec(`UPDATE checklists SET title = ? WHERE id = ?`, title, id); err != nil {
		return nil, err
	}
	return s.GetList(id)
}

// ToggleListAssignee backs checklist.toggleAssignee (toggleListAssignee(listId,
// personId)). Adds the person if absent, removes if present. Returns the full
// list so the broadcast carries the new person_ids.
func (s *Store) ToggleListAssignee(listID, personID int) (*model.Checklist, error) {
	var updated *model.Checklist
	err := s.tx(func(txn *sql.Tx) error {
		var one int
		err := txn.QueryRow(`SELECT 1 FROM checklists_persons WHERE list_id = ? AND person_id = ?`,
			listID, personID).Scan(&one)
		switch {
		case err == sql.ErrNoRows:
			_, err = txn.Exec(`INSERT INTO checklists_persons (list_id, person_id) VALUES (?, ?)`,
				listID, personID)
		case err == nil:
			_, err = txn.Exec(`DELETE FROM checklists_persons WHERE list_id = ? AND person_id = ?`,
				listID, personID)
		}
		if err != nil {
			return err
		}
		updated, err = scanList(txn, listID)
		return err
	})
	return updated, err
}

// DeleteList backs checklist.delete (removeList(listId)). Cascades items +
// assignees via FK ON DELETE CASCADE.
func (s *Store) DeleteList(id int) (int, error) {
	_, err := s.db.Exec(`DELETE FROM checklists WHERE id = ?`, id)
	return id, err
}

// GetList loads one list with person_ids + items.
func (s *Store) GetList(id int) (*model.Checklist, error) {
	return scanList(s.db, id)
}

// ListChecklists loads all lists (initial fetch + dashboard glance).
func (s *Store) ListChecklists() ([]model.Checklist, error) {
	rows, err := s.db.Query(`SELECT id, title FROM checklists ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []model.Checklist
	for rows.Next() {
		var c model.Checklist
		if err := rows.Scan(&c.ID, &c.Title); err != nil {
			return nil, err
		}
		c.PersonIDs = []int{}
		c.Items = []model.ChecklistItem{}
		if err := fillList(s.db, &c); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, rows.Err()
}

// AddItem backs checklist.item.add (addItem(listId, label)). Server assigns the
// item id; the new item starts unchecked.
func (s *Store) AddItem(listID int, label string) (*model.ChecklistItem, error) {
	res, err := s.db.Exec(`INSERT INTO checklist_items (list_id, item_name, is_done) VALUES (?, ?, 0)`,
		listID, label)
	if err != nil {
		return nil, err
	}
	id, _ := res.LastInsertId()
	return &model.ChecklistItem{ID: int(id), ItemName: label, IsDone: false}, nil
}

// ToggleItem backs checklist.item.toggle (toggleItem(listId, itemId)). Flips
// is_done and returns the full updated item (broadcast carries the entity).
func (s *Store) ToggleItem(listID, itemID int) (*model.ChecklistItem, error) {
	var name string
	var cur int
	err := s.db.QueryRow(`SELECT item_name, is_done FROM checklist_items WHERE id = ? AND list_id = ?`,
		itemID, listID).Scan(&name, &cur)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	next := 0
	if cur == 0 {
		next = 1
	}
	if _, err := s.db.Exec(`UPDATE checklist_items SET is_done = ? WHERE id = ?`, next, itemID); err != nil {
		return nil, err
	}
	return &model.ChecklistItem{ID: itemID, ItemName: name, IsDone: next == 1}, nil
}

// DeleteItem backs checklist.item.delete (removeItem(listId, itemId)).
func (s *Store) DeleteItem(listID, itemID int) (int, error) {
	_, err := s.db.Exec(`DELETE FROM checklist_items WHERE id = ? AND list_id = ?`, itemID, listID)
	return itemID, err
}

// scanList loads one list (from a tx or the DB) with person_ids + items.
func scanList(q qer, id int) (*model.Checklist, error) {
	c := &model.Checklist{PersonIDs: []int{}, Items: []model.ChecklistItem{}}
	err := q.QueryRow(`SELECT id, title FROM checklists WHERE id = ?`, id).Scan(&c.ID, &c.Title)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	if err := fillList(q, c); err != nil {
		return nil, err
	}
	return c, nil
}

// fillList loads person_ids + items into an existing list shell.
func fillList(q qer, c *model.Checklist) error {
	prows, err := q.Query(`SELECT person_id FROM checklists_persons WHERE list_id = ? ORDER BY person_id`, c.ID)
	if err != nil {
		return err
	}
	defer prows.Close()
	for prows.Next() {
		var pid int
		if err := prows.Scan(&pid); err != nil {
			return err
		}
		c.PersonIDs = append(c.PersonIDs, pid)
	}
	if err := prows.Err(); err != nil {
		return err
	}

	irows, err := q.Query(`SELECT id, item_name, is_done FROM checklist_items WHERE list_id = ? ORDER BY id`, c.ID)
	if err != nil {
		return err
	}
	defer irows.Close()
	for irows.Next() {
		var it model.ChecklistItem
		var done int
		if err := irows.Scan(&it.ID, &it.ItemName, &done); err != nil {
			return err
		}
		it.IsDone = done == 1
		c.Items = append(c.Items, it)
	}
	return irows.Err()
}