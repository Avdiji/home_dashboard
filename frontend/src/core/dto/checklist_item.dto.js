import { ChecklistItem } from "../models/checklist_item";

export class ChecklistItemDTO {
  constructor({ id, itemName, is_done, description = "" } = {}) {
    this.id = id;
    this.itemName = itemName;
    this.is_done = Boolean(is_done);
    this.description = description ?? "";
  }

  toModel() {
    return new ChecklistItem({
      id: this.id,
      itemName: this.itemName,
      is_done: this.is_done,
      description: this.description,
    });
  }
}