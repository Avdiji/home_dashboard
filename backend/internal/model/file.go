package model

// Folder mirrors the `Folder` entity (FolderDTO). ParentID is *int so it
// marshals as null for a root-level folder.
type Folder struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	ParentID *int   `json:"parent_id"`
}

// File mirrors the `File` entity (FileDTO). Metadata only — the bytes live on
// disk and are served by GET /api/files/{id}/content. FolderID is null for a
// root-level file. created_at is RFC 3339.
type File struct {
	ID        int    `json:"id"`
	FolderID  *int   `json:"folder_id"`
	Name      string `json:"name"`
	MimeType  string `json:"mime_type"`
	Size      int64  `json:"size"`
	CreatedAt string `json:"created_at"`
}
