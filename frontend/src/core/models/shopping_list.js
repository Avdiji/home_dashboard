import { ShoppingItem } from "./shopping_item";

export class ShoppingList {
  constructor({ id, title, items = [] } = {}) {
    this.id = id;
    this.title = title;
    this.items = items.map((i) =>
      i instanceof ShoppingItem ? i : new ShoppingItem(i)
    );
  }
}