-- Home Dashboard schema. snake_case column names mirror docs/asyncapi.yaml.
-- person_ids for events/checklists live in junction tables (not JSON blobs)
-- so membership is queryable; assembled into arrays on read.

CREATE TABLE IF NOT EXISTS persons (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT    NOT NULL,
    birthday TEXT    NULL          -- ISO "YYYY-MM-DD", NULL when unset
);

CREATE TABLE IF NOT EXISTS events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    location    TEXT    NOT NULL DEFAULT '',
    start_at    TEXT    NOT NULL,   -- RFC 3339
    end_at      TEXT    NOT NULL,   -- RFC 3339
    frequency   TEXT    NOT NULL DEFAULT 'none',  -- none|daily|weekly|monthly|yearly
    interval    INTEGER NOT NULL DEFAULT 1,      -- recurrence interval (every N units)
    exclusions  TEXT    NOT NULL DEFAULT '[]',    -- JSON array of skipped occurrence starts (ISO 3339)
    is_birthday INTEGER NOT NULL DEFAULT 0       -- 0/1: auto-created birthday event (title localized on the client)
);

CREATE TABLE IF NOT EXISTS events_persons (
    event_id  INTEGER NOT NULL REFERENCES events(id)   ON DELETE CASCADE,
    person_id INTEGER NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, person_id)
);

CREATE TABLE IF NOT EXISTS checklists (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS checklists_persons (
    list_id   INTEGER NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
    person_id INTEGER NOT NULL REFERENCES persons(id)    ON DELETE CASCADE,
    PRIMARY KEY (list_id, person_id)
);

CREATE TABLE IF NOT EXISTS checklist_items (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    list_id  INTEGER NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    is_done  INTEGER NOT NULL DEFAULT 0  -- 0/1 boolean
);

CREATE TABLE IF NOT EXISTS recipes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    ingredients  TEXT NOT NULL DEFAULT '[]',  -- JSON array of strings
    servings    INTEGER NULL,
    minutes     INTEGER NULL
);

CREATE TABLE IF NOT EXISTS meals (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    date      TEXT NOT NULL,           -- ISO "YYYY-MM-DD"
    recipe_id INTEGER NULL REFERENCES recipes(id) ON DELETE SET NULL,
    label     TEXT NOT NULL DEFAULT ''
);

-- Helpful read paths.
CREATE INDEX IF NOT EXISTS idx_events_persons_person ON events_persons(person_id);
CREATE INDEX IF NOT EXISTS idx_checklists_persons_person ON checklists_persons(person_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_list ON checklist_items(list_id);
CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
CREATE INDEX IF NOT EXISTS idx_meals_recipe ON meals(recipe_id);