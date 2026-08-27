package store

import (
	"database/sql"
	"encoding/json"

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
	Interval    *int
	Exclusions  *[]string
}

// eventColumns is the canonical read column list, used by ListEvents + scanEvent.
const eventColumns = `id, title, description, location, start_at, end_at, frequency, interval, exclusions`

// normalize fills defaults for legacy rows / unset fields so callers always
// see a well-formed model: interval >= 1, exclusions non-nil.
func normalize(e *model.Event) {
	if e.Interval < 1 {
		e.Interval = 1
	}
	if e.Exclusions == nil {
		e.Exclusions = []string{}
	}
}

// CreateEvent backs event.add (addEvent({ title, description, location,
// start_at, end_at, person_ids, frequency, interval })).
func (s *Store) CreateEvent(e *model.Event) (*model.Event, error) {
	normalize(e)
	var created *model.Event
	err := s.tx(func(txn *sql.Tx) error {
		res, e2 := txn.Exec(`INSERT INTO events (title, description, location, start_at, end_at, frequency, interval, exclusions)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			e.Title, e.Description, e.Location, e.StartAt, e.EndAt, e.Frequency, e.Interval, exclusionsJSON(e.Exclusions))
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
			frequency   = COALESCE(?, frequency),
			interval    = COALESCE(?, interval),
			exclusions  = COALESCE(?, exclusions)
			WHERE id = ?`,
			p.Title, p.Description, p.Location, p.StartAt, p.EndAt, p.Frequency, p.Interval,
			exclusionsArg(p.Exclusions), id); err != nil {
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
	rows, err := s.db.Query(`SELECT ` + eventColumns + ` FROM events ORDER BY id`)
	if err != nil {
		return nil, err
	}
	var out []model.Event
	for rows.Next() {
		var e model.Event
		var exclRaw string
		if err := rows.Scan(&e.ID, &e.Title, &e.Description, &e.Location, &e.StartAt, &e.EndAt,
			&e.Frequency, &e.Interval, &exclRaw); err != nil {
			rows.Close()
			return nil, err
		}
		e.Exclusions = parseExclusions(exclRaw)
		normalize(&e)
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

// ExcludeOccurrence backs "delete this occurrence only": it adds occurrenceStart
// (ISO 3339) to the base event's exclusions, so the recurrence expansion skips
// that one instance while leaving the rest of the series intact. Idempotent —
// a start already in the set is not re-added. Returns the updated event.
func (s *Store) ExcludeOccurrence(id int, occurrenceStart string) (*model.Event, error) {
	var updated *model.Event
	err := s.tx(func(txn *sql.Tx) error {
		var exclRaw string
		if err := txn.QueryRow(`SELECT exclusions FROM events WHERE id = ?`, id).Scan(&exclRaw); err != nil {
			if err == sql.ErrNoRows {
				return ErrNotFound
			}
			return err
		}
		excl := parseExclusions(exclRaw)
		if _, found := inExclusions(excl, occurrenceStart); !found {
			excl = append(excl, occurrenceStart)
		}
		if _, err := txn.Exec(`UPDATE events SET exclusions = ? WHERE id = ?`, exclusionsJSON(excl), id); err != nil {
			return err
		}
		var err error
		updated, err = scanEvent(txn, id)
		return err
	})
	return updated, err
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
	var exclRaw string
	err := q.QueryRow(`SELECT `+eventColumns+` FROM events WHERE id = ?`, id).
		Scan(&e.ID, &e.Title, &e.Description, &e.Location, &e.StartAt, &e.EndAt,
			&e.Frequency, &e.Interval, &exclRaw)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	e.Exclusions = parseExclusions(exclRaw)
	normalize(e)
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

// exclusionsJSON serializes the exclusion list for the column; empty → "[]".
func exclusionsJSON(s []string) string {
	if len(s) == 0 {
		return "[]"
	}
	b, err := json.Marshal(s)
	if err != nil {
		return "[]"
	}
	return string(b)
}

// exclusionsArg returns a SQL argument for an optional exclusions patch: nil
// pointer → nil (COALESCE keeps the old value), otherwise the JSON string.
func exclusionsArg(p *[]string) any {
	if p == nil {
		return nil
	}
	return exclusionsJSON(*p)
}

// parseExclusions unmarshals the exclusions JSON column.
func parseExclusions(raw string) []string {
	if raw == "" {
		return []string{}
	}
	var out []string
	if err := json.Unmarshal([]byte(raw), &out); err != nil {
		return []string{}
	}
	if out == nil {
		return []string{}
	}
	return out
}

// inExclusions returns the index + found for an ISO start in the set.
func inExclusions(excl []string, start string) (int, bool) {
	for i, s := range excl {
		if s == start {
			return i, true
		}
	}
	return -1, false
}