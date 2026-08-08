package store

import (
	"database/sql"

	"homedashboard/internal/model"
)

// EventPatch is the partial-update payload for event.update. Pointer fields
// mean "this key was present"; a nil pointer leaves that column unchanged so
// the patch only touches provided keys (matches updateEvent(eventId, patch)).
type EventPatch struct {
	Title       *string
	Description *string
	Location    *string
	StartAt     *string
	EndAt       *string
	PersonIDs   *[]int
	Frequency   *string
}

// CreateEvent backs event.add (addEvent({ title, description, location,
// start_at, end_at, person_ids, frequency })).
func (s *Store) CreateEvent(e *model.Event) (*model.Event, error) {
	var created *model.Event
	err := s.tx(func(txn *sql.Tx) error {
		res, e2 := txn.Exec(`INSERT INTO events (title, description, location, start_at, end_at, frequency)
			VALUES (?, ?, ?, ?, ?, ?)`,
			e.Title, e.Description, e.Location, e.StartAt, e.EndAt, e.Frequency)
		if e2 != nil {
			return e2
		}
		id, _ := res.LastInsertId()
		if err := setIDs(txn, "events_persons", "event_id", int(id), e.PersonIDs); err != nil {
			return err
		}
		var err error
		created, err = scanEvent(txn, int(id))
		return err
	})
	return created, err
}

// UpdateEvent backs event.update. Only present patch keys are applied. Editing
// a recurring event updates the whole series (one base record) — per-occurrence
// exceptions are a future feature.
func (s *Store) UpdateEvent(id int, p EventPatch) (*model.Event, error) {
	var updated *model.Event
	err := s.tx(func(txn *sql.Tx) error {
		if _, err := txn.Exec(`UPDATE events SET
			title       = COALESCE(?, title),
			description = COALESCE(?, description),
			location    = COALESCE(?, location),
			start_at    = COALESCE(?, start_at),
			end_at      = COALESCE(?, end_at),
			frequency   = COALESCE(?, frequency)
			WHERE id = ?`,
			p.Title, p.Description, p.Location, p.StartAt, p.EndAt, p.Frequency, id); err != nil {
			return err
		}
		if p.PersonIDs != nil {
			if err := setIDs(txn, "events_persons", "event_id", id, *p.PersonIDs); err != nil {
				return err
			}
		}
		var err error
		updated, err = scanEvent(txn, id)
		return err
	})
	return updated, err
}

// DeleteEvent backs event.delete (removeEvent(eventId)).
func (s *Store) DeleteEvent(id int) (int, error) {
	_, err := s.db.Exec(`DELETE FROM events WHERE id = ?`, id)
	return id, err
}

// GetEvent loads one event with its person_ids assembled.
func (s *Store) GetEvent(id int) (*model.Event, error) {
	return scanEvent(s.db, id)
}

// ListEvents loads all events (initial fetch + dashboard upcoming).
//
// The person_ids join is loaded AFTER the outer event rows are closed. With
// SetMaxOpenConns(1) the single connection is held for the lifetime of an open
// *sql.Rows, so a nested s.db.Query while still iterating rows would block
// forever waiting for that one connection — a deadlock. Collect first, close,
// then join.
func (s *Store) ListEvents() ([]model.Event, error) {
	rows, err := s.db.Query(`SELECT id, title, description, location, start_at, end_at, frequency FROM events ORDER BY id`)
	if err != nil {
		return nil, err
	}
	var out []model.Event
	for rows.Next() {
		var e model.Event
		if err := rows.Scan(&e.ID, &e.Title, &e.Description, &e.Location, &e.StartAt, &e.EndAt, &e.Frequency); err != nil {
			rows.Close()
			return nil, err
		}
		e.PersonIDs = []int{}
		out = append(out, e)
	}
	if err := rows.Err(); err != nil {
		rows.Close()
		return nil, err
	}
	rows.Close() // release the connection before the nested per-event join
	for i := range out {
		if err := loadEventPersons(s.db, &out[i]); err != nil {
			return nil, err
		}
	}
	return out, nil
}

// qer is the subset of *sql.DB / *sql.Tx needed for one entity's read queries.
// Both satisfy it, so scanEvent works inside a transaction or on the shared DB.
type qer interface {
	QueryRow(query string, args ...any) *sql.Row
	Query(query string, args ...any) (*sql.Rows, error)
}

// scanEvent reads one event row (from a tx or the DB) and attaches its person_ids.
func scanEvent(q qer, id int) (*model.Event, error) {
	e := &model.Event{}
	err := q.QueryRow(`SELECT id, title, description, location, start_at, end_at, frequency FROM events WHERE id = ?`, id).
		Scan(&e.ID, &e.Title, &e.Description, &e.Location, &e.StartAt, &e.EndAt, &e.Frequency)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	e.PersonIDs = []int{}
	return e, loadEventPersons(q, e)
}

// loadEventPersons fills e.PersonIDs from the events_persons junction.
func loadEventPersons(q qer, e *model.Event) error {
	rows, err := q.Query(`SELECT person_id FROM events_persons WHERE event_id = ? ORDER BY person_id`, e.ID)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var pid int
		if err := rows.Scan(&pid); err != nil {
			return err
		}
		e.PersonIDs = append(e.PersonIDs, pid)
	}
	return rows.Err()
}