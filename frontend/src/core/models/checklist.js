import { ChecklistItem } from "./checklist_item";

export class Checklist {
  constructor({ id, title, items = [], remainingItems = 0, personIds = [] } = {}) {
    this.id = id;
    this.title = title;
    this.remainingItems = remainingItems;
    this.personIds = personIds.slice();

    this.items = items.map((i) =>
      i instanceof ChecklistItem ? i : new ChecklistItem(i)
    );
  }
}