package api

import (
	"bufio"
	"encoding/json"
	"errors"
	"io"
	"log"
	"mime"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"homedashboard/internal/model"
	"homedashboard/internal/store"
)

// maxUploadBytes caps one upload request (all files in it together).
const maxUploadBytes = 1 << 30 // 1 GiB

// activeContentTypes are rendered by the browser as documents that can run
// script. They are served under a CSP sandbox so an uploaded page runs in an
// opaque origin and can never reach the dashboard's origin (cookies, the API,
// the parent frame). PDFs are deliberately NOT sandboxed — Chrome refuses to
// render its PDF viewer in a sandboxed context.
var activeContentTypes = map[string]bool{
	"text/html":             true,
	"application/xhtml+xml": true,
	"image/svg+xml":         true,
	"text/xml":              true,
	"application/xml":       true,
}

// uploadFiles backs the frontend's uploadFiles(folderId, files):
// POST /api/files, multipart/form-data with an optional `folder_id` field
// (sent before the files; empty = root) and one or more `file` parts. Each
// part is streamed straight to disk, then broadcast as file.created so every
// client (including the uploader) folds it into its store. Responds with the
// created file rows.
func (s *Server) uploadFiles(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxUploadBytes)
	mr, err := r.MultipartReader()
	if err != nil {
		http.Error(w, "expected multipart/form-data: "+err.Error(), http.StatusBadRequest)
		return
	}

	var folderID *int
	created := []model.File{}
	for {
		part, err := mr.NextPart()
		if err == io.EOF {
			break
		}
		if err != nil {
			http.Error(w, "read upload: "+err.Error(), http.StatusBadRequest)
			return
		}

		switch part.FormName() {
		case "folder_id":
			raw, _ := io.ReadAll(io.LimitReader(part, 32))
			if v := strings.TrimSpace(string(raw)); v != "" {
				id, err := strconv.Atoi(v)
				if err != nil {
					http.Error(w, "invalid folder_id", http.StatusBadRequest)
					return
				}
				folderID = &id
			}
		case "file":
			name := part.FileName()
			if name == "" {
				continue
			}
			body := bufio.NewReader(part)
			f, err := s.store.CreateFile(folderID, name, detectMime(name, part.Header.Get("Content-Type"), body), body)
			if err != nil {
				http.Error(w, "store "+name+": "+err.Error(), http.StatusInternalServerError)
				return
			}
			s.hub.Broadcast(marshalEvent(fileCreated(f, "")))
			created = append(created, *f)
		}
		_ = part.Close()
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(created)
}

// detectMime picks a file's content type: the browser-supplied part type when
// it is specific, else the extension, else a sniff of the first bytes.
func detectMime(name, partType string, body *bufio.Reader) string {
	if partType != "" && partType != "application/octet-stream" {
		return partType
	}
	if t := mime.TypeByExtension(strings.ToLower(filepath.Ext(name))); t != "" {
		return t
	}
	head, _ := body.Peek(512)
	return http.DetectContentType(head)
}

// fileContent serves a file's bytes: GET /api/files/{id}/content. Inline by
// default so the browser can preview it (iframe/img/video); `?download=1`
// switches to an attachment. http.ServeContent handles Range requests, so
// video/audio seek and large PDFs stream.
func (s *Server) fileContent(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}
	meta, err := s.store.GetFile(id)
	if errors.Is(err, store.ErrNotFound) {
		http.NotFound(w, r)
		return
	}
	if err != nil {
		http.Error(w, "load file: "+err.Error(), http.StatusInternalServerError)
		return
	}
	blob, err := s.store.OpenFile(id)
	if errors.Is(err, store.ErrNotFound) {
		http.NotFound(w, r)
		return
	}
	if err != nil {
		log.Printf("open blob %d: %v", id, err)
		http.Error(w, "open file", http.StatusInternalServerError)
		return
	}
	defer blob.Close()

	disposition := "inline"
	if r.URL.Query().Get("download") != "" {
		disposition = "attachment"
	}
	h := w.Header()
	h.Set("Content-Type", meta.MimeType)
	h.Set("Content-Disposition", mime.FormatMediaType(disposition, map[string]string{"filename": meta.Name}))
	h.Set("X-Content-Type-Options", "nosniff")
	// A file id's bytes never change (no overwrite — re-upload makes a new id).
	h.Set("Cache-Control", "private, max-age=31536000, immutable")
	base, _, _ := mime.ParseMediaType(meta.MimeType)
	if activeContentTypes[base] {
		h.Set("Content-Security-Policy", "sandbox allow-scripts")
	}

	modTime, _ := time.Parse(time.RFC3339, meta.CreatedAt)
	http.ServeContent(w, r, meta.Name, modTime, blob)
}
