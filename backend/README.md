# Home Dashboard — Backend (Go)

Realtime backend for the Home Dashboard frontend. Implements
[`docs/asyncapi.yaml`](../docs/asyncapi.yaml): client→server **command**
messages (one per frontend Zustand noop) over a websocket, and server→client
**event** broadcasts fanned out to every client. SQLite (pure-Go driver) is the
source of truth; seeds mirror `frontend/src/core/seeds/*` so the dashboard looks
identical whether the frontend reads its seeds or swaps them for these
endpoints.

## Run

Go 1.22+ required.

```bash
cd backend
go mod tidy          # fetches gorilla/websocket + modernc.org/sqlite (writes go.sum)
go run .             # serves :8080, creates home_dashboard.db, seeds empty tables
```

Env overrides:

| var                    | default              | meaning                                  |
|------------------------|----------------------|------------------------------------------|
| `HOME_DASHBOARD_ADDR`  | `:8080`              | listen address                           |
| `HOME_DASHBOARD_DB`    | `home_dashboard.db`  | SQLite file path                         |

## Endpoints

**REST — initial loads** (the frontend swaps its seeds for these on mount):

- `GET /api/persons`
- `GET /api/events`
- `GET /api/checklists`
- `GET /api/recipes`
- `GET /api/meals`
- `GET /healthz`

**WebSocket — realtime:**

- `ws://localhost:8080/ws` — one connection per client. Send command messages
  `{ action, requestId?, payload }`; receive event broadcasts
  `{ type, entity, id, listId?, requestId?, data }`.

## How it maps to the spec

| Spec layer                         | Code                                            |
|------------------------------------|-------------------------------------------------|
| Entity schemas (snake_case)        | `internal/model/*.go` + JSON tags               |
| Command messages (client→server)   | `internal/api/command.go` — `Dispatch` switch    |
| Event envelopes (server→client)    | `internal/api/events.go` — builders + `Event`    |
| `commands` channel (read pump)      | `internal/ws/client.go` `readPump`               |
| `events` channel (broadcast)       | `internal/ws/hub.go` `Hub.Broadcast`             |
| Store / persistence                | `internal/store/*.go` over SQLite               |
| Seed data (mirror frontend seeds)  | `internal/seed/seed.go`                          |

Commands are fire-and-forget: the server persists, then broadcasts the
resulting event to all clients (including the sender), which apply it via their
store action. The created/updated id comes back in the broadcast, not a reply.
A failed command returns an `error` message to the originating client only
(pragmatic, out of spec):

```json
{ "type": "error", "action": "...", "requestId": "...", "error": "..." }
```

## Notes / known divergences

- **IDs are integers** (SQLite AUTOINCREMENT) matching the frontend seeds. If
  the backend switches to UUIDs, change `id` columns + model fields in one pass.
- **`ChecklistItem.itemName` is camelCase** (not `item_name`) — preserved to
  match the frontend `ChecklistItemDTO`. Normalize the DTO + schema + column
  mapping together if changed.
- **`person.update` requires `name`** — the member form always sends name +
  birthday together, so both columns are set directly (birthday NULLs when
  cleared). The spec lists name/birthday as optional patch keys; a future
  "absent vs null" distinction would need a presence flag if the form ever
  sends partial updates.
- **CORS is permissive** (`*`, GET/OPTIONS). Tighten for production.
- **No `meal.update`** — matches the store; change = delete + add.