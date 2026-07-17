import { useState } from "react";

export default function useShoppingList({ lists: initialLists }) {
  const [lists] = useState(initialLists);

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