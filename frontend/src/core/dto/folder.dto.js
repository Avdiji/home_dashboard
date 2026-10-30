import { Folder } from "../models/folder";

export class FolderDTO {
  constructor({ id, name = "", parent_id = null } = {}) {
    this.id = id;
    this.name = name;
    this.parentId = parent_id;
  }

  toModel() {
    return new Folder({
      id: this.id,
      name: this.name,
      parentId: this.parentId,
    });
  }
}
