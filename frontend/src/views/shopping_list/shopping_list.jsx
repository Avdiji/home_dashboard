import AddButton from "../../components/buttons/add_button";
import PageHeader from "../../components/page_header/page_header";
import ListCard from "./components/list_card";
import useShoppingList from "./hooks/use_shopping_list";
import classes from "./shopping_list.module.css";

export default function ShoppingList() {
  const {
    lists,
    toggleItem,
    removeItem,
    addItem,
    updateTitle,
    addList,
    removeList,
  } = useShoppingList();

  return (
    <div className={classes.view}>
      <PageHeader title="Shopping List" subtitle="Shopping and shared lists" />

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