export class Folder {
  constructor({ id, name = "", parentId = null } = {}) {
    this.id = id;
    this.name = name;
    this.parentId = parentId;
  }
}
