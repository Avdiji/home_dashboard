import { FileEntry } from "../models/file_entry";

export class FileEntryDTO {
  constructor({
    id,
    folder_id = null,
    name = "",
    mime_type = "application/octet-stream",
    size = 0,
    created_at,
  } = {}) {
    this.id = id;
    this.folderId = folder_id;
    this.name = name;
    this.mimeType = mime_type;
    this.size = Number(size) || 0;
    this.createdAt = created_at ? new Date(created_at) : new Date();
  }

  toModel() {
    return new FileEntry({
      id: this.id,
      folderId: this.folderId,
      name: this.name,
      mimeType: this.mimeType,
      size: this.size,
      createdAt: this.createdAt,
    });
  }
}
