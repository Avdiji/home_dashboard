import AddButton from "../../components/buttons/add_button";
import PageHeader from "../../components/page_header/page_header";
import ListCard from "./components/list_card";
import useChecklist from "./hooks/use_checklist";
import classes from "./checklist.module.css";

export default function Checklist() {
  const {
    lists,
    toggleItem,
    removeItem,
    addItem,
    updateTitle,
    addList,
    removeList,
  } = useChecklist();

  return (
    <div className={classes.view}>
      <PageHeader title="Checklist" subtitle="Shared checklists" />

      <div className={classes.grid}>
        {lists.map((list) => (
          <ListCard
            key={list.id}
            list={list}
            onToggleItem={toggleItem}
            onRemoveItem={removeItem}
            onUpdateTitle={updateTitle}
            onRemoveList={removeList}
            onAddItem={addItem}
          />
        ))}
      </div>

      <div className={classes.add_list}>
        <AddButton variant="ghost" onClick={addList}>
          + New list
        </AddButton>
      </div>
    </div>
  );
}