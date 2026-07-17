import { ShoppingItemDTO } from "./shopping_item.dto";
import { ShoppingList } from "../models/shopping_list";

export class ShoppingListDTO {
  constructor({ id, title, items = [] } = {}) {
    this.id = id;
    this.title = title;
    this.items = items.map((i) =>
      i instanceof ShoppingItemDTO ? i : new ShoppingItemDTO(i)
    );
  }

  toModel() {
    return new ShoppingList({
      id: this.id,
      title: this.title,
      items: this.items.map((i) => i.toModel()),
      remainingItems: this.items.filter((i) => !i.is_done).length,
    });
  }
}