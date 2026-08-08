package ws

import (
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 8192
	sendBufferSize = 256
)

// Client is one websocket connection. readPump reads commands and dispatches
// them; writePump drains the send channel and writes events back. The Hub owns
// the client set; the client closes itself by unregistering.
type Client struct {
	hub      *Hub
	conn     *websocket.Conn
	dispatch DispatchFunc
	send     chan []byte
}

func newClient(h *Hub, conn *websocket.Conn, dispatch DispatchFunc) *Client {
	return &Client{
		hub:      h,
		conn:     conn,
		dispatch: dispatch,
		send:     make(chan []byte, sendBufferSize),
	}
}

// readPump reads inbound command messages, hands each to dispatch, and pushes
// any resulting events onto the hub's broadcast channel. Dispatch errors are
// sent back to this client only (the hub broadcast is for everyone).
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		_ = c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	_ = c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		_ = c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})
	for {
		_, raw, err := c.conn.ReadMessage()
		if err != nil {
			return // closed, upgraded, or deadline exceeded
		}
		events, reply := c.dispatch(raw)
		// reply goes only to the originating client (error detail)
		if reply != nil {
			select {
			case c.send <- reply:
			default:
			}
		}
		for _, ev := range events {
			c.hub.Broadcast(ev)
		}
	}
}

// writePump drains the send channel and writes messages to the connection. It
// also sends periodic pings to keep the connection alive and detect dead peers.
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		_ = c.conn.Close()
	}()
	for {
		select {
		case msg, ok := <-c.send:
			_ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				_ = c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				return
			}
		case <-ticker.C:
			_ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}