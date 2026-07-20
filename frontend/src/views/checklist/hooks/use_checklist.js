import { useState } from "react";
import { SEED_PERSONS } from "../../../core/seeds/persons";
import { SEED_LISTS } from "../../../core/seeds/checklists";

export default function useChecklist() {
  const [lists] = useState(SEED_LISTS);
  const [persons] = useState(SEED_PERSONS);
  const [memberFilter, setMemberFilter] = useState(() => new Set());
  const [listFormOpen, setListFormOpen] = useState(false);

  const visibleLists =
    memberFilter.size === 0
      ? lists
      : lists.filter((l) => l.personIds.some((id) => memberFilter.has(id)));

  const openNewList = () => setListFormOpen(true);
  const closeListForm = () => setListFormOpen(false);

  // noop — toggle item wiring handled once backend lands
  const toggleItem = (listId, itemId) => {};
  // noop — remove item wiring handled once backend lands
  const removeItem = (listId, itemId) => {};
  // noop — add item wiring handled once backend lands
  const addItem = (listId, label) => {};
  // noop — update title wiring handled once backend lands
  const updateTitle = (listId, title) => {};
  // noop — add list wiring handled once backend lands
  const addList = ({ title, personIds }) => {};
  // noop — remove list wiring handled once backend lands
  const removeList = (listId) => {};
  // noop — assign member wiring handled once backend lands
  const toggleListAssignee = (listId, personId) => {};

  return {
    lists,
    visibleLists,
    persons,
    memberFilter,
    setMemberFilter,
    listFormOpen,
    openNewList,
    closeListForm,
    toggleItem,
    removeItem,
    addItem,
    updateTitle,
    addList,
    removeList,
    toggleListAssignee,
  };
}