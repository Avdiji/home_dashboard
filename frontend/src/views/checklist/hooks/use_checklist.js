import { useState } from "react";
import { ChecklistDTO } from "../../../core/dto/checklist.dto";

const SEED_LISTS = [
  new ChecklistDTO({
    id: 1,
    title: "Groceries",
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
    items: [
      { id: 1, itemName: "Screws M4", is_done: false },
      { id: 2, itemName: "Paintbrush", is_done: false },
    ],
  }).toModel(),
  new ChecklistDTO({
    id: 3,
    title: "Edeka",
    items: [
      { id: 1, itemName: "Mie Noodles", is_done: false },
      { id: 2, itemName: "Tomatoes", is_done: true },
    ],
  }).toModel(),
];

export default function useChecklist() {
  const [lists] = useState(SEED_LISTS);

  // noop — toggle item wiring handled once backend lands
  const toggleItem = (listId, itemId) => {};
  // noop — remove item wiring handled once backend lands
  const removeItem = (listId, itemId) => {};
  // noop — add item wiring handled once backend lands
  const addItem = (listId, label) => {};
  // noop — update title wiring handled once backend lands
  const updateTitle = (listId, title) => {};
  // noop — add list wiring handled once backend lands
  const addList = () => {};
  // noop — remove list wiring handled once backend lands
  const removeList = (listId) => {};

  return {
    lists,
    toggleItem,
    removeItem,
    addItem,
    updateTitle,
    addList,
    removeList,
  };
}