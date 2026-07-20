# Home Dashboard — Frontend

A shared family home dashboard. Single-page React app with four features behind a
left feature panel: **Dashboard**, **Calendar**, **Checklist**, **Meal Plan**.

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
    seeds/persons.js          # shared family roster (SEED_PERSONS) — cross-feature
    seeds/events.js           # shared family calendar events (SEED_EVENTS) — cross-feature
    frequency.js              # recurrence/enum constants (calendar)
    utils/date_utils.js       # date math + formatting (shared)
    utils/weather_codes.js    # WMO weather code → { label, icon } (Open-Meteo)
    nav_config.jsx            # routes + FEATURES (feature panel config)
  components/                  # reusable UI (cards/card, buttons/add_button, buttons/icon_button, layout, feature_panel)
  theme/
    tokens.css                # design tokens (:root custom properties) — ALL colors live here
    media_breakpoints.css     # @custom-media --mobile / --tablet / --desktop
  views/
    dashboard/                # see Dashboard section
    calendar/                 # see Calendar section
    checklist/
    meal_plan/
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

**Exception — shared reference data:** the family member roster (`SEED_PERSONS`,
Anna/Mark/Lena) lives in `core/seeds/persons.js`, not a feature hook, because the
same members back every feature (calendar events, checklists, …). Each feature
hook imports it and holds it in its own `useState` (so the future fetch swap is
per-hook). The calendar events (`SEED_EVENTS`) likewise live in
`core/seeds/events.js` and are imported by both `use_calendar` (its `events`
state) and `use_dashboard` (the "upcoming" list is a view over the same events —
clicking an upcoming card deep-links to that event's edit modal, so the
dashboard must reference the real event ids). Per-feature data otherwise still
seeds in its own hook.

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
(`use_calendar`), Checklist (`use_checklist`), and Meal Plan (`use_meal_plan`)
all follow this. Dashboard (`use_dashboard`) follows it too.

## Feature notes

### Dashboard (`views/dashboard/`)

The landing page. A glance at today, all in **one big panel** (not many small
cards): live clock, weather (+ hourly forecast), upcoming events, today's dish,
and the family roster. Follows the hook-per-feature pattern (`use_dashboard`);
the view is thin (hook + render). The view wraps everything in a single `.mega`
panel (card styling — panel bg, `--line-strong` border, `--shadow-card`,
radius 16) and groups sections with small uppercase `--muted` labels (`Section`
helper in `dashboard.jsx`). Leaf components (`clock_card`, `weather_card`,
`hourly_strip`, `upcoming_card`, `dish_card`, `members_card`) render **content
only, no `Card` wrapper** — the mega panel is the only card.

- **Live clock**: `now` in `useState`, a `setInterval(1000)` `useEffect` ticks it
  every second — the first ticking timer in the app. Derived in the hook as
  `clock = { time (HH:MM via `formatTime24` — 24h, no am/pm), seconds, weekday
  (WEEKDAYS_LONG_SUN[getDay()]), date (formatDate), greeting, dayProgress }`.
  `dayProgress` is the % of 24h elapsed (drives a progress bar). Greeting is
  time-of-day ("Good morning" / "afternoon" / "evening") and renders as the
  `PageHeader` subtitle. `ClockCard` is a **circular clock with two concentric
  SVG rings**: the outer ring fills with `--accent-2` by `dayProgress` (the day),
  the inner (thinner) ring fills with `--accent` by `seconds/60` and sweeps +
  resets every minute — a continuous "seconds" breath inside the day ring. Time
  `HH:MM` centered (accent-2, tabular-nums) + weekday + date. **No am/pm
  anywhere on the dashboard** — uses
  `formatTime24` (added to `date_utils.js`, locale-independent 24h), not
  `formatTime` (which is locale-dependent and shared with the calendar).
  `WEEKDAYS_LONG` is Mon-first; `getDay()` is Sun-first, so the hook uses
  `WEEKDAYS_LONG_SUN` (added to `date_utils.js` for this) — do not index
  `WEEKDAYS_LONG` with `getDay()`.
- **Weather**: live via `navigator.geolocation` + Open-Meteo (free, no API key).
  Geolocation runs once on mount → coords stored in a `useRef` → first fetch.
  A `setInterval` then **refetches every 15 min** using the stored coords (no
  re-prompt) — 15 min matches Open-Meteo's `current` update cadence (more frequent
  just returns cached data). Falls back to `SEED_WEATHER` (seeded `WeatherDTO`) on
  denial / error / unsupported `geolocation`. Open-Meteo is a **third-party API,
  not the project backend** — a deliberate exception to the "all data seeded" rule;
  weather is external data, not feature data. `WeatherDTO` takes the Open-Meteo payload
  (`current.temperature_2m`, `apparent_temperature`, `relative_humidity_2m`,
  `weather_code`, `wind_speed_10m`, `is_day` + `daily.sunrise[0]`/`sunset[0]` +
  4 `hourly` entries pre-extracted by the hook into `{ time, temperature,
  weatherCode }`) → `Weather` model (carries `hours[]`).
  `describeWeatherCode(code, isDay)` (in `core/utils/weather_codes.js`) maps WMO
  codes to `{ label, icon (emoji) }`; `isDay` swaps clear-sky sun ↔ moon.
  `WeatherCard` shows icon + temp + feels-like + label + wind + humidity + a
  sunrise/sunset row. `HourlyStrip` shows the next 4 hours and is **coupled
  into the Weather section**: a borderless vertical list rendered beside
  `WeatherCard` inside the now-section's right side (both content-width
  `flex:0 0 auto`, clustered close together on the left; not its own labeled
  section, no card/box). Each row is time · icon · temp (left-aligned); the
  first row shows the actual next hour (e.g. `15:00`), not a "now" label — the
  seed starts at `getHours() + 1` and the live fetch starts at the first hour
  `>= now`, so the first entry is the upcoming hour. A prominent separator
  (`.sep`, 2px `--line-strong`) sits **between** weather and forecast — a
  vertical rule on desktop (side by side), a horizontal rule on `--mobile`
  (stacked). The seed hours are built via a `Date` so `startHour + i` rolls
  past midnight (23 → 01:00 next day, not `"25:00"` → `NaN:NaN`); the live
  fetch uses `forecast_days=2` so enough hours remain late at night.
- **Upcoming**: `UpcomingCard` renders the next 3 calendar events (start `>= now`,
  sorted, sliced to 3) **derived from the shared `SEED_EVENTS`** (not its own
  seed) so a row click deep-links to that event's edit modal. Live relative-time
  label ("in 2h", "tomorrow", "in 3d") computed against the ticking `now`, plus
  member-initials chips. It is its own full-width section and is **prominent** —
  each row is a tinted panel (`--panel-2`) with a 3px `--accent-2` left border,
  larger time + title. **Rows are clickable** (`role="button"`, Enter/Space
  supported) → `goToEvent(id)` navigates to `CALENDAR_PATH` with
  `{ state: { editEventId } }`; `use_calendar` reads that state on mount and opens
  the `EventForm` for the matching event, then clears the state. Recurring events
  with a past base start are filtered out (no occurrence expansion in the
  dashboard — the backend fetch handles recurrence when it lands).
- **Today's dish**: seeded in the hook (`SEED_TODAY_MEAL` + `SEED_TODAY_RECIPE`),
  planned for today's date at module load so the demo always shows a dish. The
  recipe id mirrors the meal plan's `SEED_RECIPES` (id 1 "Pasta Pomodoro") so the
  click deep-link resolves. `todaysDish` is `{ label, recipe }` or `null`.
  `DishCard` is a **distinct centered "recipe hero"** (deliberately not the
  upcoming row style): a circular accent-tinted emoji tile (🍽️) + centered dish
  name + pill badges (servings / minutes, when the recipe carries them) +
  description; or a muted "Nothing planned today" with the tile. **Clickable when
  it has a recipe** → `goToRecipe(recipeId)` navigates to `MEAL_PLAN_PATH` with
  `{ state: { editRecipeId } }`; `use_meal_plan` reads that state on mount and
  opens the `RecipeForm` for the matching recipe, then clears the state. A
  free-text dish (no `recipeId`) is not clickable.
- **Members (roster CRUD)**: `persons` in `useState` (initialized from the shared
  `SEED_PERSONS`). `addPerson({ name })`, `updatePerson(personId, { name })`,
  `removePerson(personId)` are **noops with full signatures** — the backend is the
  single source of truth, so roster mutations don't visually update until it lands
  (same as item toggle / `addList` elsewhere). The signature is the spec for the
  future backend call. **No PersonProvider by design**: calendar/checklist keep
  their own seeded `SEED_PERSONS` until the backend unifies the rosters (the user's
  call — "members will be fetched from the backend"). Editing members on the
  dashboard does not propagate to calendar/checklist during the frontend-only phase.
  The members UI is **deliberately subtle**: no header add-button — a muted "+ Add
  member" text link at the list bottom; row remove (✕) is hover-reveal only
  (muted → `--danger`), not an always-visible `RemoveButton` (the dashboard's
  members rows use a local hover-reveal button, not the shared `RemoveButton`,
  which stays always-visible for its other three sites).
- **`member_form`** (modal): single `name` field, mirrors the `event_form` /
  `recipe_form` modal pattern (`Modal` + `form_controls`). New vs edit decided by
  whether a `person` prop is passed. No Delete button in the form — removal is the
  roster row's hover-reveal ✕. Save disabled without a name.
- **Layout**: one `.mega` panel containing a vertical stack (`gap: 28px`) of:
  a combined **"now" section** (clock + weather + hourly as one seamless block
  on a `--panel-2` bg — same color as the Today's dish block, no accent border —
  covering the upper portion; no internal divider between clock and weather),
  then upcoming + dish in an equal `layout.twoColGrid` (same baseline, **same
  height** — `.section > :last-child` is `flex:1` so each card fills the grid row
  height set by the taller one; the dish centers its content vertically to match
  the upcoming list), then members full width. Inside the now-section, the
  right side is a row: `WeatherCard` (content-width) · vertical `.sep` ·
  `HourlyStrip` (content-width, clustered close to the weather). The now-section
  is a row only on `--desktop`; it **stacks** (clock · weather · `.sep` ·
  forecast) at `--until-desktop` (tablet + mobile) so the row never gets cramped
  on a tablet. On `--mobile` the clock shrinks to 160px, weather centers under
  it, the `.sep` becomes a horizontal rule, and the hourly list is centered
  (`align-self:center`) on the clock's vertical line.
  `PageHeader` title "Home" + greeting subtitle sits above the mega panel. The
  clock ring tracks use `--line-strong` so they stay visible on the `--panel-2`
  now-block bg. Every dashboard block reads as a card with `--shadow-card`: the
  now-section, each upcoming row, and the dish block (the hourly list is
  borderless/integrated, and members stays a subtle chip row — both unshadowed).

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
  `autoFocus` anywhere. **Deep-link**: `use_calendar` reads
  `location.state.editEventId` on mount (set by the dashboard's upcoming click),
  opens the edit form for the matching event, then clears the state — so an
  external link can land on a specific event's modal.
- Clicking an event opens the **edit** form (edits the whole series — the
  occurrence carries the full base event); clicking empty day area opens the
  **new** form.
- `EventChip` renders as a `<button>` when given an `onClick` (month/week, with
  `stopPropagation` so the click doesn't bubble into cell/day-card handlers) and as
  a non-interactive `<div>` when not (day view — the whole card is the clickable
  element). In the day view the member chips render once, in the card's top-right
  corner, highlighted (accent-2 bg) — never duplicated.

### Checklist (`views/checklist/`)

Multiple named lists, each a `Card` with an editable title input, member
assignment, checkable items, add-item row, and remove-list. A list carries
`personIds[]` (members assigned to it) — assigned via `AssignPicker` in the card
body, mirroring the calendar event form pattern. A **member filter** in the
toolbar (multi-select toggle pills: All + each member) filters `visibleLists`
to lists assigned to any selected member (empty selection = All) — pure
client-side view state (a `Set` of member ids), not a backend mutation. The
person roster is the shared `SEED_PERSONS` (see Architecture). Noop handlers
take params matching the call sites
(`toggleItem(listId, itemId)`, `updateTitle(listId, title)`, `addItem(listId, label)`,
`removeList(listId)`, `addList({ title, personIds })`, `toggleListAssignee(listId, personId)`).
"+ New list" opens a modal (`list_form`) — title + member assignment via
`AssignPicker`, Save disabled without a title — mirroring the calendar/meal-plan
modal pattern (form open state `listFormOpen` in the hook).

### Meal Plan (`views/meal_plan/`)

A recipe library plus a date-keyed meal plan. Two entities:

- **Recipe** (`core/models/recipe.js`): `id, title, description, ingredients[],
  servings, minutes`. Persisted in the library; edited via a modal form.
- **Meal** (`core/models/meal.js`): `id, date (ISO "YYYY-MM-DD"), recipeId (nullable),
  label`. A dish planned for a date. A meal either links to a recipe
  (`recipeId` set) or is a free-text dish (`label` only) — a recipe is **not**
  mandatory.

The view has two **tabs** (`TabSwitcher`, tab state in the hook as `tab`/`setTab`,
mirrors the calendar view-in-hook pattern): **Recipes** grid (`RecipeCard`, click
opens the edit form) and **Planned dishes** list (`MealRow`, sorted by date asc).
The toolbar's add button is context-sensitive — "+ New recipe" on the Recipes tab,
"+ Plan a dish" on the Planned dishes tab. Clicking a planned dish that has a
`recipeId` opens that recipe's form — "forwarded to the corresponding recipe"; a
free-text dish is plain text with no link. Each planned dish shows the weekday
(e.g. Mon) above the date, computed from the date string (`new Date("...T00:00:00")`
to avoid UTC-shift).

Two modal forms, both mirroring the calendar `event_form` overlay/dialog CSS:
- **`recipe_form`**: title, servings, minutes, description, ingredients (textarea,
  one per line → split into array). Edit mode adds Delete; Save disabled without a
  title.
- **`meal_form`**: date (`<input type="date">`), recipe (`<select>` of recipes +
  "— None —"), label (disabled when a recipe is chosen — the dish name comes from
  the recipe). Save disabled when no recipe and no label.

Form open state lives in the hook, split per form (`recipeFormOpen`/`editingRecipe`
and `mealFormOpen`/`mealFormDate`), mirroring the calendar 3-piece pattern.
Noop handlers: `addRecipe({ title, description, ingredients, servings, minutes })`,
`updateRecipe(recipeId, { ... })`, `removeRecipe(recipeId)`,
`addMeal({ date, recipeId, label })`, `removeMeal(mealId)`.

## Shared components

- **`Card`** (`components/cards/card`): props `title`, `badge`, `headerActions`,
  `children`. Card titles render in `--ink` (prominent), header is uppercase muted.
  Card border is sharpened (`#c3c7d4`) with a subtle box-shadow for separation from
  the page bg.
- **`AddButton`** (`components/buttons/add_button`): props `onClick`, `children`,
  `variant`, `size`, `disabled`. Variants/sizes map to CSS classes by name. The
  default (primary) variant is the app's standard "+ New …" action — `--accent-2`
  bg, `--on-accent` text, hover `brightness(0.95)` — shared by every feature's
  add button (calendar "+ New event", meal plan "+ New recipe" / "+ Plan a dish",
  checklist "+ New list", checklist list-card "+"). All add buttons use this
  primary style; `variant="ghost"` exists but is currently unused. Calendar's
  "+ New event" uses `<AddButton>`, not a local button class.
- **`AssignPicker`** (`components/assign_picker/assign_picker`): searchable-free
  multi-select dropdown (popover + scrollable checkable list + outside-click close).
  **No search input** — the member list is shown directly. Used by the calendar
  event form (lives in shared `components/` so it is reusable across features; do not
  duplicate).
- **`PageHeader`** (`components/page_header/page_header`): props `title`, `subtitle`.
  Page title + muted subtitle block used by feature pages (e.g. checklist).
  Extracted to shared `components/` — the `.page_title`/`.page_sub` CSS was previously
  duplicated identically across feature CSS modules.
- **`Modal`** (`components/modal/modal`): opinionated modal shell. Props
  `{ title, onClose, onSave, saveDisabled, onDelete, children }`. Renders overlay
  (click → `onClose`) + dialog (stopPropagation) + `<h2>` title + children + an
  actions row (Delete when `onDelete` is passed, then Cancel + Save). Used by all
  three modal forms (`event_form`, `recipe_form`, `meal_form`) — they bring their
  fields and submit/remove logic; `Modal` owns the overlay/dialog/actions CSS.
- **`SegmentedControl`** (`components/segmented_control/segmented_control`): props
  `{ items: [{key,label,value}], value, onChange }`. Buttons keyed by `item.key`
  (string), compared by `value === item.value` (works with calendar's Symbol view
  modes), calls `onChange(item.value)`. Replaces the old feature-local
  `view_switcher` (calendar) and `tab_switcher` (meal plan) — one source for both.
- **`RemoveButton`** (`components/buttons/remove_button`): always-visible ✕. Props
  `{ onClick, title, size="md", className?, children }`. Muted → `--danger` on
  hover, borderless. `size="sm"` = 14px, `"md"` = 16px. Accepts a `className` (merged)
  so callers can add e.g. `margin-left:auto` (meal row pins it right). Used by
  checklist list-card header, checklist list item, and meal row. Always visible —
  no parent-hover reveal, so one component covers all three sites cleanly.
- **`form_controls.module.css`** (`components/forms/form_controls`): shared field
  CSS only (no component) — `.row`, `.col` (modifier), `.lbl`, `.input`, `.select`,
  `.textarea`, `.gapAbove` + the focus ring. All three modal forms import it and
  apply `controls.row` / `controls.input` etc. instead of duplicating field CSS.
  Forms keep only their form-specific layout CSS (e.g. `event_form`'s `.dates`
  start/end pair, `recipe_form`'s `.meta` servings/minutes pair).
- **`layout.twoColGrid`** (`components/layout/layout.module.css`): the 2-column
  responsive grid (`repeat(2, 1fr)`, `gap: 20px`, collapses to 1 col on `--mobile`)
  used by meal plan recipes and checklist lists. Both features used it verbatim —
  one shared class now.
- **`group_by_day`** (`views/calendar/utils/group_by_day`): `dayKey(d)` +
  `groupOccurrencesByDay(days, occurrences)` (a `Map<dayKey, occ[]>` pre-seeded
  with one empty bucket per day). Feature-local to calendar (per the `core/` rule) —
  `month_view` and `week_view` both build the same per-day buckets.

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