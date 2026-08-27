// Package db: migrations add columns to existing SQLite databases that CREATE
// TABLE IF NOT EXISTS cannot (it never touches an existing table). migrate is
// idempotent — safe to run on every Open. It introspects PRAGMA table_info and
// only applies a change when the target column is absent.
package db

import (
	"database/sql"
	"fmt"
)

// migrate applies additive schema changes to an already-open DB.
func migrate(db *sql.DB) error {
	if err := ensureColumn(db, "events", "interval", "INTEGER NOT NULL DEFAULT 1"); err != nil {
		return err
	}
	if err := ensureColumn(db, "events", "exclusions", "TEXT NOT NULL DEFAULT '[]'"); err != nil {
		return err
	}
	if err := ensureColumn(db, "events", "is_birthday", "INTEGER NOT NULL DEFAULT 0"); err != nil {
		return err
	}
	return nil
}

// ensureColumn adds `col coltype` to `table` if it is not already present.
func ensureColumn(db *sql.DB, table, col, coltype string) error {
	present, err := hasColumn(db, table, col)
	if err != nil {
		return err
	}
	if present {
		return nil
	}
	_, err = db.Exec(fmt.Sprintf(`ALTER TABLE %s ADD COLUMN %s %s`, table, col, coltype))
	if err != nil {
		return fmt.Errorf("alter %s.%s: %w", table, col, err)
	}
	return nil
}

// hasColumn reports whether `table` has a column named `col`.
func hasColumn(db *sql.DB, table, col string) (bool, error) {
	rows, err := db.Query(fmt.Sprintf(`PRAGMA table_info(%s)`, table))
	if err != nil {
		return false, fmt.Errorf("pragma %s: %w", table, err)
	}
	defer rows.Close()
	for rows.Next() {
		var cid int
		var name, ctype string
		var notnull, pk int
		var dflt sql.NullString
		if err := rows.Scan(&cid, &name, &ctype, &notnull, &dflt, &pk); err != nil {
			return false, err
		}
		if name == col {
			return true, nil
		}
	}
	return false, rows.Err()
}