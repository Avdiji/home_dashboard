export class ChecklistItem {
  constructor({ id, itemName, is_done, description = "" } = {}) {
    this.id = id;
    this.itemName = itemName;
    this.is_done = Boolean(is_done);
    this.description = description ?? "";
  }
}