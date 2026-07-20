import AddButton from "../../components/buttons/add_button";
import PageHeader from "../../components/page_header/page_header";
import layout from "../../components/layout/layout.module.css";
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

      <div className={classes.add_list}>
        <AddButton onClick={addList}>
          + New list
        </AddButton>
      </div>

      <div className={layout.twoColGrid}>
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
    </div>
  );
}