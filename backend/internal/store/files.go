package store

import (
	"database/sql"
	"errors"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"homedashboard/internal/model"
)

// Files: metadata rows in SQLite, bytes on disk under filesDir named by the
// row id (no user-supplied name ever touches the filesystem, so there is no
// path traversal surface). Folders nest via parent_id; deleting a folder
// cascades its subtree in SQL and the matching blobs are removed here.

// blobPath is the on-disk location of a file's bytes.
func (s *Store) blobPath(id int) string {
	return filepath.Join(s.filesDir, strconv.Itoa(id))
}

// OpenFile opens a file's bytes for serving. The caller closes it.
func (s *Store) OpenFile(id int) (*os.File, error) {
	f, err := os.Open(s.blobPath(id))
	if errors.Is(err, fs.ErrNotExist) {
		return nil, ErrNotFound
	}
	return f, err
}

// CreateFile backs the upload endpoint (uploadFiles(folderId, files)). The
// bytes are streamed to a temp blob first, then the row is inserted and the
// blob renamed to its id — a failed insert (e.g. unknown folder_id, FK) leaves
// nothing behind.
func (s *Store) CreateFile(folderID *int, name, mimeType string, r io.Reader) (*model.File, error) {
	tmp, err := os.CreateTemp(s.filesDir, ".upload-*")
	if err != nil {
		return nil, err
	}
	tmpPath := tmp.Name()
	size, err := io.Copy(tmp, r)
	if cerr := tmp.Close(); err == nil {
		err = cerr
	}
	if err != nil {
		_ = os.Remove(tmpPath)
		return nil, err
	}

	createdAt := time.Now().UTC().Format(time.RFC3339)
	res, err := s.db.Exec(`INSERT INTO files (folder_id, name, mime_type, size, created_at)
		VALUES (?, ?, ?, ?, ?)`, folderID, name, mimeType, size, createdAt)
	if err != nil {
		_ = os.Remove(tmpPath)
		return nil, err
	}
	id64, _ := res.LastInsertId()
	id := int(id64)
	if err := os.Rename(tmpPath, s.blobPath(id)); err != nil {
		_ = os.Remove(tmpPath)
		_, _ = s.db.Exec(`DELETE FROM files WHERE id = ?`, id)
		return nil, err
	}
	return s.GetFile(id)
}

// DeleteFile backs file.delete (removeFile(fileId)).
func (s *Store) DeleteFile(id int) (int, error) {
	if _, err := s.db.Exec(`DELETE FROM files WHERE id = ?`, id); err != nil {
		return id, err
	}
	s.removeBlob(id)
	return id, nil
}

// removeBlob deletes a file's bytes. Best-effort: the row is already gone, so
// a leftover blob is an orphan, never a dangling reference.
func (s *Store) removeBlob(id int) {
	_ = os.Remove(s.blobPath(id))
}

// GetFile loads one file's metadata.
func (s *Store) GetFile(id int) (*model.File, error) {
	f := &model.File{}
	var folderID sql.NullInt64
	err := s.db.QueryRow(`SELECT id, folder_id, name, mime_type, size, created_at FROM files WHERE id = ?`, id).
		Scan(&f.ID, &folderID, &f.Name, &f.MimeType, &f.Size, &f.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	f.FolderID = nullableInt(folderID)
	return f, nil
}

// ListFiles loads all file metadata (initial fetch).
func (s *Store) ListFiles() ([]model.File, error) {
	rows, err := s.db.Query(`SELECT id, folder_id, name, mime_type, size, created_at FROM files ORDER BY name COLLATE NOCASE, id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []model.File
	for rows.Next() {
		var f model.File
		var folderID sql.NullInt64
		if err := rows.Scan(&f.ID, &folderID, &f.Name, &f.MimeType, &f.Size, &f.CreatedAt); err != nil {
			return nil, err
		}
		f.FolderID = nullableInt(folderID)
		out = append(out, f)
	}
	return out, rows.Err()
}

// CreateFolder backs folder.add (addFolder({ name, parentId })).
func (s *Store) CreateFolder(name string, parentID *int) (*model.Folder, error) {
	res, err := s.db.Exec(`INSERT INTO folders (name, parent_id) VALUES (?, ?)`, name, parentID)
	if err != nil {
		return nil, err
	}
	id, _ := res.LastInsertId()
	return s.GetFolder(int(id))
}

// DeleteFolder backs folder.delete (removeFolder(folderId)). Returns every
// folder and file id in the removed subtree so the API layer can broadcast a
// deleted event for each. Rows go via ON DELETE CASCADE; blobs are removed
// after the commit.
func (s *Store) DeleteFolder(id int) (folderIDs, fileIDs []int, err error) {
	err = s.tx(func(txn *sql.Tx) error {
		folderIDs, err = queryIDs(txn, `WITH RECURSIVE sub(id) AS (
				SELECT id FROM folders WHERE id = ?
				UNION ALL SELECT f.id FROM folders f JOIN sub ON f.parent_id = sub.id
			) SELECT id FROM sub`, id)
		if err != nil {
			return err
		}
		fileIDs, err = queryIDs(txn, `WITH RECURSIVE sub(id) AS (
				SELECT id FROM folders WHERE id = ?
				UNION ALL SELECT f.id FROM folders f JOIN sub ON f.parent_id = sub.id
			) SELECT id FROM files WHERE folder_id IN (SELECT id FROM sub)`, id)
		if err != nil {
			return err
		}
		_, err = txn.Exec(`DELETE FROM folders WHERE id = ?`, id)
		return err
	})
	if err != nil {
		return nil, nil, err
	}
	for _, fid := range fileIDs {
		s.removeBlob(fid)
	}
	return folderIDs, fileIDs, nil
}

// GetFolder loads one folder.
func (s *Store) GetFolder(id int) (*model.Folder, error) {
	f := &model.Folder{}
	var parentID sql.NullInt64
	err := s.db.QueryRow(`SELECT id, name, parent_id FROM folders WHERE id = ?`, id).
		Scan(&f.ID, &f.Name, &parentID)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	f.ParentID = nullableInt(parentID)
	return f, nil
}

// ListFolders loads all folders (initial fetch). The client builds the tree.
func (s *Store) ListFolders() ([]model.Folder, error) {
	rows, err := s.db.Query(`SELECT id, name, parent_id FROM folders ORDER BY name COLLATE NOCASE, id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []model.Folder
	for rows.Next() {
		var f model.Folder
		var parentID sql.NullInt64
		if err := rows.Scan(&f.ID, &f.Name, &parentID); err != nil {
			return nil, err
		}
		f.ParentID = nullableInt(parentID)
		out = append(out, f)
	}
	return out, rows.Err()
}

func queryIDs(txn *sql.Tx, q string, args ...any) ([]int, error) {
	rows, err := txn.Query(q, args...)
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

func nullableInt(n sql.NullInt64) *int {
	if !n.Valid {
		return nil
	}
	v := int(n.Int64)
	return &v
}
