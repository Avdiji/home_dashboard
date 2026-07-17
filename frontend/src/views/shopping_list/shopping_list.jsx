import AddButton from "../../components/buttons/add_button";
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
      <h1 className={classes.page_title}>
        Shopping List
        <div className={classes.page_sub}>Shopping and shared lists</div>
      </h1>

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