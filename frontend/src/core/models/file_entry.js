// Named FileEntry (not File) so it never shadows the browser's global File.
// Metadata only — the bytes are fetched from the content URL.
export class FileEntry {
  constructor({
    id,
    folderId = null,
    name = "",
    mimeType = "application/octet-stream",
    size = 0,
    createdAt = new Date(),
  } = {}) {
    this.id = id;
    this.folderId = folderId;
    this.name = name;
    this.mimeType = mimeType;
    this.size = size;
    this.createdAt = createdAt;
  }
}
