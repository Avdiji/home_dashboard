// Package ws is the websocket transport: a Hub fans broadcast events out to all
// connected clients, and a Client is one connection with a read pump (commands
// in) and a write pump (events out). gorilla/websocket is the only dependency.
package ws

import (
	"sync"

	"github.com/gorilla/websocket"
)

// Hub keeps the set of connected clients and broadcasts event messages to all
// of them. A single Hub is shared by every connection.
type Hub struct {
	mu      sync.RWMutex
	clients map[*Client]struct{}

	broadcast  chan []byte // outbound event JSON, fanned out to every client
	register   chan *Client
	unregister chan *Client
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]struct{}),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

// Run is the Hub's event loop. Run it once in its own goroutine at startup.
func (h *Hub) Run() {
	for {
		select {
		case c := <-h.register:
			h.mu.Lock()
			h.clients[c] = struct{}{}
			h.mu.Unlock()
		case c := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[c]; ok {
				delete(h.clients, c)
				close(c.send)
			}
			h.mu.Unlock()
		case msg := <-h.broadcast:
			h.mu.RLock()
			for c := range h.clients {
				select {
				case c.send <- msg:
				default:
					// client send buffer full — drop it so a slow client can't
					// stall the broadcast.
					go func(cc *Client) { h.unregister <- cc }(c)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// Broadcast enqueues an event message for delivery to all clients. Non-blocking
// up to the broadcast channel buffer (256); the Hub loop drains it.
func (h *Hub) Broadcast(msg []byte) {
	select {
	case h.broadcast <- msg:
	default:
	}
}

// Handle upgrades the HTTP connection to a websocket and runs the client's
// read+write pumps until the connection closes. This is the /ws handler.
func (h *Hub) Handle(dispatch DispatchFunc) func(c *websocket.Conn) {
	return func(conn *websocket.Conn) {
		client := newClient(h, conn, dispatch)
		h.register <- client
		go client.writePump()
		client.readPump() // blocks until disconnect
	}
}

// DispatchFunc turns a raw inbound command (from a client's read pump) into the
// event messages to broadcast to every client, plus an optional reply sent
// only to the originating client (e.g. a validation/persistence error). The API
// layer supplies this; it owns command parsing + store mutation.
type DispatchFunc func(raw []byte) (events [][]byte, reply []byte)