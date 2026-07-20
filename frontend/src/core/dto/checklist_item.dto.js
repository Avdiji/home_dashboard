import { ChecklistItem } from "../models/checklist_item";

export class ChecklistItemDTO {
  constructor({ id, itemName, is_done } = {}) {
    this.id = id;
    this.itemName = itemName;
    this.is_done = Boolean(is_done);
  }

  toModel() {
    return new ChecklistItem({
      id: this.id,
      itemName: this.itemName,
      is_done: this.is_done,
    });
  }
}