import { useState } from "react";
import { PersonDTO } from "../../../core/dto/person.dto";
import { TodoDTO } from "../../../core/dto/todo.dto";

const SEED_PERSONS = [
  new PersonDTO({ id: 1, name: "Anna" }).toModel(),
  new PersonDTO({ id: 2, name: "Mark" }).toModel(),
  new PersonDTO({ id: 3, name: "Lena" }).toModel(),
];

const SEED_TODOS = [
  new TodoDTO({ id: 1, label: "Math homework", is_done: true, personIds: [1] }).toModel(),
  new TodoDTO({ id: 2, label: "Brush teeth", is_done: true, personIds: [1, 3] }).toModel(),
  new TodoDTO({ id: 3, label: "Tidy room", is_done: false, personIds: [1] }).toModel(),
  new TodoDTO({ id: 4, label: "Pay electricity bill", is_done: false, personIds: [2] }).toModel(),
  new TodoDTO({ id: 5, label: "Fix kitchen tap", is_done: true, personIds: [2] }).toModel(),
  new TodoDTO({ id: 6, label: "Clean room", is_done: false, personIds: [3, 1] }).toModel(),
  new TodoDTO({ id: 7, label: "Pick up parcel", is_done: false, personIds: [3] }).toModel(),
];

export default function useTodoList() {
  const [todos] = useState(SEED_TODOS);
  const [persons] = useState(SEED_PERSONS);
  const [activeFilters, setActiveFilters] = useState(() => new Set());

  // noop — toggle wiring handled once backend lands
  const toggleTodo = (todoId) => {};
  // noop — remove todo wiring handled once backend lands
  const removeTodo = (todoId) => {};
  // noop — add todo wiring handled once backend lands
  const addTodo = ({ label, personIds }) => {};

  const toggleFilter = (personId) => {
    const next = new Set(activeFilters);
    if (next.has(personId)) next.delete(personId);
    else next.add(personId);
    setActiveFilters(next);
  };
  const showAll = () => setActiveFilters(new Set());

  const filtered =
    activeFilters.size === 0
      ? todos
      : todos.filter((t) => t.personIds.some((id) => activeFilters.has(id)));

  const open = filtered.filter((t) => !t.isDone);
  const done = filtered.filter((t) => t.isDone);

  const personName = (id) =>
    persons.find((p) => p.id === id)?.name ?? "Unassigned";

  return {
    persons,
    activeFilters,
    toggleTodo,
    removeTodo,
    addTodo,
    toggleFilter,
    showAll,
    open,
    done,
    personName,
  };
}