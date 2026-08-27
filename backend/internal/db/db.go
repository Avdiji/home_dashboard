// Package db opens the SQLite database and applies the schema.
package db

import (
	"database/sql"
	_ "embed"
	"fmt"

	_ "modernc.org/sqlite" // pure-Go SQLite driver (no CGO); registers as "sqlite"
)

//go:embed schema.sql
var schemaSQL string

// Open opens (or creates) the SQLite file and ensures the schema exists.
// It enables foreign keys so the ON DELETE CASCADE / SET NULL rules fire.
func Open(path string) (*sql.DB, error) {
	dsn := fmt.Sprintf("file:%s?_pragma=foreign_keys(1)&_pragma=busy_timeout(5000)", path)
	db, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, fmt.Errorf("open sqlite: %w", err)
	}
	// SQLite serializes writes; a single connection avoids SQLITE_BUSY churn.
	db.SetMaxOpenConns(1)

	if _, err := db.Exec(schemaSQL); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("apply schema: %w", err)
	}
	if err := migrate(db); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("migrate: %w", err)
	}
	return db, nil
}
