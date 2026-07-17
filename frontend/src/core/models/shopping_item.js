export class ShoppingItem {
  constructor({ id, itemName, is_done } = {}) {
    this.id = id;
    this.itemName = itemName;
    this.is_done = Boolean(is_done);
  }
}