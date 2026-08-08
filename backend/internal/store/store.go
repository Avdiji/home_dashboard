// Package store is the persistence layer: one repo per entity over SQLite.
// Each mutating method runs in a transaction and returns the full resulting
// entity (or just the id for deletes) so the API layer can broadcast the spec
// event envelope. This is what the frontend noops swap in for — the method
// signatures match the noop call contracts.
package store

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
)

// Store wraps the SQLite connection. Methods are safe for concurrent use:
// modernc/sqlite serializes via SetMaxOpenConns(1) and a mutex here guards
// reads-vs-writes within a request.
type Store struct {
	db *sql.DB
}

func New(db *sql.DB) *Store {
	return &Store{db: db}
}

// DB exposes the underlying connection for callers that need raw queries
// (e.g. seed.Run counts tables). Normal mutations go through the typed methods.
func (s *Store) DB() *sql.DB { return s.db }

// ErrNotFound is returned by single-entity getters; the API layer maps it to
// a command error broadcast.
var ErrNotFound = errors.New("not found")

// tx runs fn inside a transaction, committing on nil error and rolling back
// otherwise. SQLite writes are serialized, so a transaction also serializes
// the mutation end-to-end.
func (s *Store) tx(fn func(*sql.Tx) error) error {
	txn, err := s.db.Begin()
	if err != nil {
		return err
	}
	if err := fn(txn); err != nil {
		_ = txn.Rollback()
		return err
	}
	return txn.Commit()
}

// loadIDs reads the person ids joined to an entity from a junction table.
func loadIDs(txn *sql.Tx, table, ownerCol string, ownerID int) ([]int, error) {
	q := fmt.Sprintf(`SELECT person_id FROM %s WHERE %s = ? ORDER BY person_id`, table, ownerCol)
	rows, err := txn.Query(q, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []int{}
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		out = append(out, id)
	}
	return out, rows.Err()
}

// setIDs replaces the person-id set for an entity in a junction table.
func setIDs(txn *sql.Tx, table, ownerCol string, ownerID int, ids []int) error {
	if _, err := txn.Exec(
		fmt.Sprintf(`DELETE FROM %s WHERE %s = ?`, table, ownerCol), ownerID,
	); err != nil {
		return err
	}
	seen := map[int]bool{}
	for _, pid := range ids {
		if seen[pid] {
			continue // dedup defensively
		}
		seen[pid] = true
		if _, err := txn.Exec(
			fmt.Sprintf(`INSERT INTO %s (%s, person_id) VALUES (?, ?)`, table, ownerCol),
			ownerID, pid,
		); err != nil {
			return err
		}
	}
	return nil
}

// jsonStrings marshals a []string for the recipes.ingredients column.
func jsonStrings(ss []string) string {
	b, err := json.Marshal(ss)
	if err != nil {
		return "[]"
	}
	return string(b)
}

// parseStrings unmarshals the ingredients JSON array.
func parseStrings(raw string) []string {
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