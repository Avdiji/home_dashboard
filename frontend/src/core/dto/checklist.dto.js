import { ChecklistItemDTO } from "./checklist_item.dto";
import { Checklist } from "../models/checklist";

export class ChecklistDTO {
  constructor({ id, title, items = [], person_ids = [] } = {}) {
    this.id = id;
    this.title = title;
    this.person_ids = Array.isArray(person_ids) ? person_ids.slice() : [];
    this.items = items.map((i) =>
      i instanceof ChecklistItemDTO ? i : new ChecklistItemDTO(i)
    );
  }

  toModel() {
    return new Checklist({
      id: this.id,
      title: this.title,
      items: [...this.items]
        .sort((a, b) => Number(a.is_done) - Number(b.is_done))
        .map((i) => i.toModel()),
      remainingItems: this.items.filter((i) => !i.is_done).length,
      personIds: this.person_ids,
    });
  }
}