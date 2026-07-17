import { ShoppingItem } from "../models/shopping_item";

export class ShoppingItemDTO {
  constructor({ id, itemName, is_done } = {}) {
    this.id = id;
    this.itemName = itemName;
    this.is_done = Boolean(is_done);
  }

  toModel() {
    return new ShoppingItem({
      id: this.id,
      itemName: this.itemName,
      is_done: this.is_done,
    });
  }
}