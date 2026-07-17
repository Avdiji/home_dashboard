import AddButton from "../../components/buttons/add_button";
import { ShoppingListDTO } from "../../core/dto/shopping_list.dto";
import ListCard from "./components/list_card";
import useShoppingList from "./hooks/use_shopping_list";
import classes from "./shopping_list.module.css";

const SEED_LISTS = [
  new ShoppingListDTO({
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
  new ShoppingListDTO({
    id: 2,
    title: "Hardware store",
    items: [
      { id: 1, itemName: "Screws M4", is_done: false },
      { id: 2, itemName: "Paintbrush", is_done: false },
    ],
  }).toModel(),
  new ShoppingListDTO({
    id: 3,
    title: "Edeka",
    items: [
      { id: 1, itemName: "Mie Noodles", is_done: false },
      { id: 2, itemName: "Tomatoes", is_done: true },
    ],
  }).toModel(),
];

export default function ShoppingList() {
  const {
    lists,
    toggleItem,
    removeItem,
    addItem,
    updateTitle,
    addList,
    removeList,
  } = useShoppingList({ lists: SEED_LISTS });

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