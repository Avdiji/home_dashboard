// Event→store reducer. Takes a server broadcast Event envelope (or an error
// reply) and applies it to the matching Zustand store. This is the websocket
// "apply" half: a mutation command comes back as a broadcast event (delivered
// to ALL clients, including the originator) and is folded into local state
// here — no optimistic update happens at the call site.
//
// Envelope shape (internal/api/events.go):
//   { type:"<entity>.<created|updated|deleted>", entity, id, listId?, requestId?, data }
// `data` is the full snake_case entity for created/updated, or null for deleted.
// For checklist_item events, `listId` identifies the parent list.
//
// snake_case → model coercion reuses the existing *DTO classes so the same
// path the seeds use now serves live data too.

import { usePersons } from "../../store/persons_store";
import { useEvents } from "../../store/events_store";
import { useChecklists } from "../../store/checklists_store";
import { useRecipes } from "../../store/recipes_store";
import { useMeals } from "../../store/meals_store";
import { PersonDTO } from "../dto/person.dto";
import { EventDTO } from "../dto/event.dto";
import { ChecklistDTO } from "../dto/checklist.dto";
import { ChecklistItemDTO } from "../dto/checklist_item.dto";
import { RecipeDTO } from "../dto/recipe.dto";
import { MealDTO } from "../dto/meal.dto";
import { transition } from "../utils/view_transition";

// upsert by id: replace if present, else append.
const upsert = (arr, item) =>
  arr.some((x) => x.id === item.id)
    ? arr.map((x) => (x.id === item.id ? item : x))
    : [...arr, item];

const remove = (arr, id) => arr.filter((x) => x.id !== id);

// Recompute a list's remainingItems count from its items (the DTO derives it on
// toModel; item-level events mutate a list in place so we rebuild it).
const withItems = (list, items) => ({
  ...list,
  items,
  remainingItems: items.filter((i) => !i.is_done).length,
});

const persons = (evt) => {
  if (evt.type === "person.deleted") {
    usePersons.setState((s) => ({ persons: remove(s.persons, evt.id) }));
    return;
  }
  const model = new PersonDTO(evt.data).toModel();
  usePersons.setState((s) => ({ persons: upsert(s.persons, model) }));
};

const events = (evt) => {
  if (evt.type === "event.deleted") {
    useEvents.setState((s) => ({ events: remove(s.events, evt.id) }));
    return;
  }
  const model = new EventDTO(evt.data).toModel();
  useEvents.setState((s) => ({ events: upsert(s.events, model) }));
};

const checklists = (evt) => {
  // Item-level events mutate the parent list.
  if (evt.entity === "checklist_item") {
    const listId = evt.listId;
    useChecklists.setState((s) => ({
      lists: s.lists.map((l) => {
        if (l.id !== listId) return l;
        if (evt.type === "checklist_item.deleted") {
          return withItems(l, remove(l.items, evt.id));
        }
        const item = new ChecklistItemDTO(evt.data).toModel();
        return withItems(l, upsert(l.items, item));
      }),
    }));
    return;
  }
  if (evt.type === "checklist.deleted") {
    useChecklists.setState((s) => ({ lists: remove(s.lists, evt.id) }));
    return;
  }
  const model = new ChecklistDTO(evt.data).toModel();
  useChecklists.setState((s) => ({ lists: upsert(s.lists, model) }));
};

const recipes = (evt) => {
  if (evt.type === "recipe.deleted") {
    useRecipes.setState((s) => ({ recipes: remove(s.recipes, evt.id) }));
    return;
  }
  const model = new RecipeDTO(evt.data).toModel();
  useRecipes.setState((s) => ({ recipes: upsert(s.recipes, model) }));
};

const meals = (evt) => {
  if (evt.type === "meal.deleted") {
    useMeals.setState((s) => ({ meals: remove(s.meals, evt.id) }));
    return;
  }
  const model = new MealDTO(evt.data).toModel();
  useMeals.setState((s) => ({ meals: upsert(s.meals, model) }));
};

// applyEvent routes one inbound message to the right store. Error replies
// (type:"error", sent only to the originator) are logged, not applied. The
// store mutation is wrapped in a View Transition so entity spawn/vanish
// (items, lists, events, meals, persons, recipes) crossfades smoothly instead
// of snapping.
export function applyEvent(msg) {
  if (msg.type === "error") {
    console.error(
      `server error [${msg.action}]${msg.requestId ? ` (${msg.requestId})` : ""}: ${msg.error}`,
    );
    return;
  }
  const entity = msg.entity;
  const route = () => {
    if (entity === "person") return persons(msg);
    if (entity === "event") return events(msg);
    if (entity === "checklist" || entity === "checklist_item") return checklists(msg);
    if (entity === "recipe") return recipes(msg);
    if (entity === "meal") return meals(msg);
    console.warn("ws: unknown event entity", msg);
  };
  transition(route);
}