# Home Dashboard — Frontend

A shared family home dashboard. Single-page React app with three features behind a
left feature panel: **Dashboard**, **Calendar**, **Checklist**.

The frontend is built before the backend. All data is seeded in the feature hook
via DTOs; every backend-bound mutation is a **noop** that documents its call contract.
When the backend lands, swap seeds for fetches and fill the noop bodies — the UI
wiring already matches.

## Stack

- React 19 + Vite
- `react-router-dom` v7 (`BrowserRouter`, `Routes`, `Route`)
- CSS Modules (`.module.css`) + `postcss-custom-media`
- Plain JS (JSX), no TypeScript

## Layout

```
frontend/src/
  core/                       # shared, feature-agnostic
    dto/                       # *DTO classes — snake_case backend shape
    models/                    # plain model classes — camelCase app shape
    frequency.js              # recurrence/enum constants (calendar)
    utils/date_utils.js       # date math + formatting (shared)
    nav_config.jsx            # routes + FEATURES (feature panel config)
  components/                  # reusable UI (cards/card, buttons/add_button, buttons/icon_button, layout, feature_panel)
  theme/
    tokens.css                # design tokens (:root custom properties) — ALL colors live here
    media_breakpoints.css     # @custom-media --mobile / --tablet / --desktop
  views/
    dashboard/                # stub (not yet built)
    calendar/                 # see Calendar section
    checklist/
    <feature>/
      <feature>.jsx           # thin view: hook + render (no logic, no seeds)
      <feature>.module.css
      hooks/use_<feature>.js  # seeds + state + noops + derived logic
      components/             # feature-local components
```

Feature-local logic that no other feature uses lives under its `views/<feature>/`
dir, NOT in `core/`. (Calendar's `view_modes.js` and `recurrence.js` are under
`views/calendar/` for this reason.) `core/` only holds truly shared code.

## Architecture conventions (follow exactly)

### DTO → Model is one-way

- `core/dto/<thing>.dto.js` defines a `*DTO` class whose constructor takes the
  **snake_case** backend shape and coerces types. It has a `toModel()` that
  returns a new model instance. DTOs never expose mutation; `toModel()` is the
  only way out.
- `core/models/<thing>.js` defines a plain model class with **camelCase** fields
  and sensible constructor defaults. The model is what the UI reads.
- Arrays that must not leak identity (e.g. `personIds`) are `.slice()`-copied in
  both DTO and model constructors.

### Seeds live in the hook, not the view

Each hook defines its `SEED_*` constants (constructed via
`new XxxDTO({...}).toModel()`) at module scope and uses them as the initial value of
its own `useState` calls. The hook takes **no arguments** — `useCalendar()`,
`useChecklist()`. The view just destructures the return value
and renders; it contains no `SEED_*`, no `useState`, no business logic. This keeps
all per-feature data lifecycle (seed → state → derived → noops) in one place and
makes the view a pure render. When the backend lands, replace the `SEED_*`
constants with a fetch inside the hook (e.g. `useState(() => fetchEvents())` or an
effect) — the view does not change.

### Noops document the call contract

Backend-bound mutations are declared as noops **with their full parameter
signature matching how they are actually called** — e.g.
`const toggleItem = (listId, itemId) => {};`, `const addList = () => {};`.
The signature is the documentation; when the backend lands you fill the body and the
call sites already line up. A `// noop — <thing> wiring handled once backend lands`
comment precedes each.

### One hook per feature (the `use_calendar` pattern)

State, derived data, and noop handlers live in `views/<feature>/hooks/use_<feature>.js`.
The view component destructures what it needs and renders. The view contains **no
business logic** — only render helpers that close over hook values. Calendar
(`use_calendar`) and Checklist (`use_checklist`) both
follow this. Dashboard is a stub and has no hook yet.

## Feature notes

### Calendar (`views/calendar/`)

Shared family calendar. Events fetched from backend (seeded for now). An event has:
`id, title, description, location, start, end, personIds[] (optional), frequency`.
Frequency reuses `core/frequency.js` (once/daily/weekly/monthly).

- **`recurrence.js`** expands a base event into concrete occurrences overlapping a
  date range (`expandAll(events, rangeStart, rangeEnd)`). It fast-forwards
  long-running recurring events so a daily event started years ago doesn't iterate
  thousands of times. Recurring events share **one base record** — editing updates
  the whole series, not a single occurrence. Per-occurrence exceptions are a future
  feature, not built.
- **`view_modes.js`** exports `VIEW_DAY`/`VIEW_WEEK`/`VIEW_MONTH` as **Symbols**
  (not strings) + a frozen `VIEWS` array for the switcher. Symbols prevent
  accidental string compares; anywhere a view is compared must use the constants
  (calendar.jsx render block, use_calendar nav/title). The switcher keys its
  buttons by `v.label`, not `v.value` — Symbols can't be React keys.
- **`date_utils.js`** (in `core/utils/`) is shared; recurrence imports from it.
- Three views: **month** (7×6 grid, "+N more"), **week** (7 day-columns, timed
  chips), **day** (single list of event cards). Default view is **day**.
- **Today highlight**: accent-2 border + filled accent-2 day-number circle (month
  /week); "Today" pill (day). The day view panel uses the same `Card` styling as
  other features (`--line-strong` border + `--shadow-card`) and does **not** get an
  accent-2 border on today — only the pill marks it. Today never changes card
  background color.
- **Event form** (modal): title, location, start/end (stacked vertically on all
  breakpoints), members via `AssignPicker`, repeat, description. Edit mode adds a
  Delete button; new vs edit decided by whether an `event` prop is passed. No
  `autoFocus` anywhere.
- Clicking an event opens the **edit** form (edits the whole series — the
  occurrence carries the full base event); clicking empty day area opens the
  **new** form.
- `EventChip` renders as a `<button>` when given an `onClick` (month/week, with
  `stopPropagation` so the click doesn't bubble into cell/day-card handlers) and as
  a non-interactive `<div>` when not (day view — the whole card is the clickable
  element). In the day view the member chips render once, in the card's top-right
  corner, highlighted (accent-2 bg) — never duplicated.

### Checklist (`views/checklist/`)

Multiple named lists, each a `Card` with an editable title input, checkable items,
add-item row, and remove-list. Noop handlers take params matching the call sites
(`toggleItem(listId, itemId)`, `updateTitle(listId, title)`, `addItem(listId, label)`,
`removeList(listId)`, `addList()`).

## Shared components

- **`Card`** (`components/cards/card`): props `title`, `badge`, `headerActions`,
  `children`. Card titles render in `--ink` (prominent), header is uppercase muted.
  Card border is sharpened (`#c3c7d4`) with a subtle box-shadow for separation from
  the page bg.
- **`AddButton`** (`components/buttons/add_button`): props `onClick`, `children`,
  `variant`, `size`, `disabled`. Variants/sizes map to CSS classes by name.
- **`AssignPicker`** (`components/assign_picker/assign_picker`): searchable-free
  multi-select dropdown (popover + scrollable checkable list + outside-click close).
  **No search input** — the member list is shown directly. Used by the calendar
  event form (lives in shared `components/` so it is reusable across features; do not
  duplicate).
- **`PageHeader`** (`components/page_header/page_header`): props `title`, `subtitle`.
  Page title + muted subtitle block used by feature pages (e.g. checklist).
  Extracted to shared `components/` — the `.page_title`/`.page_sub` CSS was previously
  duplicated identically across feature CSS modules.

## Styling rules

- **All color values live in `theme/tokens.css`** as `:root` custom properties
  (`--bg`, `--panel`, `--panel-2`, `--ink`, `--muted`, `--accent`, `--accent-2`,
  `--line`, `--ok`, `--warn`, `--danger`). Do not hardcode hex in components —
  reference tokens. The page `--bg` is intentionally darker (`#e8ebf3`) so white
  `--panel` cards have contrast. Inputs use `--panel` (not `--bg`) so they read
  against the page.
- **Breakpoints**: use the established `@custom-media` names in
  `theme/media_breakpoints.css` (`--mobile`, `--tablet`, `--desktop`,
  `--until-desktop`). **Never hardcode `max-width`/`min-width` in component CSS.**
  Add a new named breakpoint to that file if you need one. Note `--tablet`
  (`min-width:600px`) also matches desktop, so "mobile + tablet" = `--until-desktop`
  (`max-width:1199px`).
- CSS Modules are scoped; composes via `className={classes.x}`. Reusable visual
  primitives go in `components/`, feature styling stays in the feature dir.

## Git

- Main branch: `main`. Feature work on numbered branches
  (`2-implement-checklist-ui`, `4-implement-calendar-ui`, …), rebased onto the
  integration branch (`dev`) before merge.
- Commit/push only when the user asks.
- Commit messages: normal prose. Co-authored-by trailer as configured.

## How the user works (read this)

- **CAVEMAN MODE** is usually active: the user wants terse replies (drop
  articles/filler/pleasantries, fragments OK) in chat. Code, commits, security
  messages, and docs like this one are written normally. It persists across turns
  until "stop caveman" / "normal mode".
- The user iterates tightly on **styling** — expect many small "a bit more
  contrast", "more spacing", "make X sharper" rounds. Make the smallest change that
  satisfies the ask; do not over-build. When they say "just a little", they mean it.
- The user sometimes **reverts changes themselves** (edits files directly). If a
  file contradicts what you last did, the user changed it intentionally — do not
  re-apply your version unless asked. System reminders will flag these reverts.
- Prefer **acting over asking**, but use `AskUserQuestion` when a styling request
  is genuinely ambiguous (e.g. "highlight the title" could mean page vs card title)
  — a wrong guess wastes a full iteration.
- The user reviews changes file-by-file. Keep diffs scoped to the request; don't
  sweep unrelated files.

## Internal reasoning worth knowing

- **Why hooks per feature**: keeps view components thin (hook + render) and
  concentrates state/noops/derived data in one testable place. Seeds live in the
  hook too, so the whole data lifecycle (seed → state → derived → noops) is in one
  file and the view is pure render. When the backend lands, swap seeds for a fetch
  inside the hook — the view stays untouched.
- **Why Symbol view modes**: string literals invited the exact bug we hit —
  `calendar.jsx` still compared `view === "month"` after the type became a Symbol,
  so nothing rendered. Symbols force every compare site to use the named constant
  or fail loudly.
- **Why noops carry full signatures**: the signature *is* the spec for the future
  backend call. Call sites already pass the right args, so wiring is just filling
  the body.
- **Why `stopPropagation` on `EventChip`**: month cells have their own `onClick`
  (new-event). Without stopping propagation, clicking a chip fired edit, then the
  cell's new-event handler overwrote the form state → wrong popup.
- **Why recurrence fast-forwards**: a daily event seeded 60 days in the past would
  otherwise iterate day-by-day up to the visible range. Jumping by computed
  day/week deltas (and looping for months) keeps it bounded.
- **Why `AssignPicker` lives in shared `components/`, not a feature dir**: it is
  imported by the calendar event form and is intended to be reused by any future
  feature needing a multi-member picker. Putting it in `components/` makes the
  cross-feature intent explicit. Search was removed from it on the user's request
  — do not re-add it.
- **Why `PageHeader` was extracted**: the `.page_title`/`.page_sub` block was
  copy-pasted identically across feature CSS modules. One shared component + one
  CSS file removes the duplication; a new feature page just drops in
  `<PageHeader title=… subtitle=… />`.