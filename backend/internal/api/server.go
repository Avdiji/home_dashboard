// Package api exposes the HTTP surface: REST GET endpoints for initial entity
// loads (the frontend swaps its seeds for these on mount) and the /ws websocket
// for realtime command/event traffic. CORS is permissive for the dev Vite
// server; tighten for production.
package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"

	"homedashboard/internal/store"
	"homedashboard/internal/ws"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  4096,
	WriteBufferSize: 4096,
	CheckOrigin:      func(r *http.Request) bool { return true }, // dev: any origin
}

// Server wires the store, ws hub, and command dispatcher to HTTP routes.
type Server struct {
	store     *store.Store
	hub       *ws.Hub
	dispatch  *Dispatcher
	serveMux  *http.ServeMux
}

func NewServer(s *store.Store, h *ws.Hub) *Server {
	srv := &Server{
		store:    s,
		hub:      h,
		dispatch: NewDispatcher(s),
		serveMux: http.NewServeMux(),
	}
	srv.routes()
	return srv
}

func (s *Server) routes() {
	s.serveMux.HandleFunc("/healthz", s.health)
	s.serveMux.HandleFunc("/ws", s.handleWS)

	s.serveMux.HandleFunc("/api/persons", s.jsonList(s.store.ListPersons))
	s.serveMux.HandleFunc("/api/events", s.jsonList(s.store.ListEvents))
	s.serveMux.HandleFunc("/api/checklists", s.jsonList(s.store.ListChecklists))
	s.serveMux.HandleFunc("/api/recipes", s.jsonList(s.store.ListRecipes))
	s.serveMux.HandleFunc("/api/meals", s.jsonList(s.store.ListMeals))
}

// ServeHTTP makes Server usable directly as an http.Handler.
func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	cors(w, r)
	s.serveMux.ServeHTTP(w, r)
}

func (s *Server) handleWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("ws upgrade: %v", err)
		return
	}
	// Hub.Handle returns the per-connection run function (read+write pumps).
	s.hub.Handle(s.dispatch.Dispatch)(conn)
}

func (s *Server) health(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	_, _ = w.Write([]byte(`{"status":"ok"}`))
}

// lister is anything returning a slice + error (the Store's List* methods).
type lister[T any] func() ([]T, error)

// jsonList adapts a Store List* method to a GET handler emitting `[]T` as JSON.
func (s *Server) jsonList[T any](fn lister[T]) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.Header().Set("Allow", http.MethodGet)
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		out, err := fn()
		if err != nil {
			http.Error(w, "load failed: "+err.Error(), http.StatusInternalServerError)
			return
		}
		if out == nil {
			out = []T{}
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(out)
	}
}

func cors(w http.ResponseWriter, _ *http.Request) {
	h := w.Header()
	h.Set("Access-Control-Allow-Origin", "*")
	h.Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	h.Set("Access-Control-Allow-Headers", "Content-Type")
}