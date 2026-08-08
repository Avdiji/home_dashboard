package store

import (
	"database/sql"

	"homedashboard/internal/model"
)

// CreatePerson backs the person.add command (addPerson({ name, birthday })).
func (s *Store) CreatePerson(name string, birthday *string) (*model.Person, error) {
	res, err := s.db.Exec(`INSERT INTO persons (name, birthday) VALUES (?, ?)`, name, birthday)
	if err != nil {
		return nil, err
	}
	id, _ := res.LastInsertId()
	return s.GetPerson(int(id))
}

// GetPerson loads one person by id.
func (s *Store) GetPerson(id int) (*model.Person, error) {
	p := &model.Person{}
	var b sql.NullString
	err := s.db.QueryRow(`SELECT id, name, birthday FROM persons WHERE id = ?`, id).
		Scan(&p.ID, &p.Name, &b)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	if b.Valid {
		p.Birthday = strPtr(b.String)
	}
	return p, nil
}

// UpdatePerson backs person.update (updatePerson(personId, { name, birthday })).
// The member_form always sends both name and birthday, so both columns are set
// directly — birthday (a *string) NULLs the column when cleared. name is
// required (the form disables Save without one).
func (s *Store) UpdatePerson(id int, name string, birthday *string) (*model.Person, error) {
	if _, err := s.db.Exec(`UPDATE persons SET name = ?, birthday = ? WHERE id = ?`,
		name, birthday, id); err != nil {
		return nil, err
	}
	return s.GetPerson(id)
}

// DeletePerson backs person.delete (removePerson(personId)). Returns the id
// for the broadcast even if the row was already gone.
func (s *Store) DeletePerson(id int) (int, error) {
	_, err := s.db.Exec(`DELETE FROM persons WHERE id = ?`, id)
	return id, err
}

// ListPersons loads the whole roster (initial fetch + dashboard members).
func (s *Store) ListPersons() ([]model.Person, error) {
	rows, err := s.db.Query(`SELECT id, name, birthday FROM persons ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []model.Person
	for rows.Next() {
		var p model.Person
		var b sql.NullString
		if err := rows.Scan(&p.ID, &p.Name, &b); err != nil {
			return nil, err
		}
		if b.Valid {
			p.Birthday = strPtr(b.String)
		}
		out = append(out, p)
	}
	return out, rows.Err()
}

func strPtr(s string) *string { return &s }