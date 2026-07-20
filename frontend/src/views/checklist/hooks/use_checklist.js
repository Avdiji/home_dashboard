import { useState } from "react";
import { usePersons } from "../../../store/persons_store";
import { useChecklists } from "../../../store/checklists_store";

export default function useChecklist() {
  // Entity state lives in the centralized stores — the dashboard's checklist
  // glance reads the same `lists`, so a checklist mutation (once the backend
  // lands) propagates everywhere. Noop action signatures come from the store.
  const lists = useChecklists((s) => s.lists);
  const persons = usePersons((s) => s.persons);
  const toggleItem = useChecklists((s) => s.toggleItem);
  const removeItem = useChecklists((s) => s.removeItem);
  const addItem = useChecklists((s) => s.addItem);
  const updateTitle = useChecklists((s) => s.updateTitle);
  const addList = useChecklists((s) => s.addList);
  const removeList = useChecklists((s) => s.removeList);
  const toggleListAssignee = useChecklists((s) => s.toggleListAssignee);

  const [memberFilter, setMemberFilter] = useState(() => new Set());
  const [listFormOpen, setListFormOpen] = useState(false);

  const visibleLists =
    memberFilter.size === 0
      ? lists
      : lists.filter((l) => l.personIds.some((id) => memberFilter.has(id)));

  const openNewList = () => setListFormOpen(true);
  const closeListForm = () => setListFormOpen(false);

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