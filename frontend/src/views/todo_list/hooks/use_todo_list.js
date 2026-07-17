import { useState } from "react";

export default function useTodoList({ todos: initialTodos, persons: initialPersons }) {
  const [todos] = useState(initialTodos);
  const [persons] = useState(initialPersons);
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