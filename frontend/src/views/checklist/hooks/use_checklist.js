import { useState } from "react";
import { ChecklistDTO } from "../../../core/dto/checklist.dto";
import { SEED_PERSONS } from "../../../core/seeds/persons";

const SEED_LISTS = [
  new ChecklistDTO({
    id: 1,
    title: "Groceries",
    person_ids: [],
    items: [
      { id: 2, itemName: "Milk", is_done: true },
      { id: 3, itemName: "Bread", is_done: false },
      { id: 4, itemName: "Eggs", is_done: false },
      { id: 5, itemName: "Pasta", is_done: false },
      { id: 6, itemName: "Tomatoes", is_done: false },
    ],
  }).toModel(),
  new ChecklistDTO({
    id: 2,
    title: "Hardware store",
    person_ids: [2],
    items: [
      { id: 1, itemName: "Screws M4", is_done: false },
      { id: 2, itemName: "Paintbrush", is_done: false },
    ],
  }).toModel(),
  new ChecklistDTO({
    id: 3,
    title: "Edeka",
    person_ids: [1, 3],
    items: [
      { id: 1, itemName: "Mie Noodles", is_done: false },
      { id: 2, itemName: "Tomatoes", is_done: true },
    ],
  }).toModel(),
];

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