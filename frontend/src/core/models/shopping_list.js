import { ShoppingItem } from "./shopping_item";

export class ShoppingList {
  constructor({ id, title, items = [], remainingItems = 0 } = {}) {
    this.id = id;
    this.title = title;
    this.remainingItems = remainingItems;

    this.items = items.map((i) =>
      i instanceof ShoppingItem ? i : new ShoppingItem(i)
    );
  }
}