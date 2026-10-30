import { create } from "zustand";
import { sendCommand } from "../core/api/transport";
import { postFiles } from "../core/api/files";

// Centralized file storage state: a flat folder list (parentId links build the
// tree client-side) + flat file metadata list (folderId, null = root).
// Module-level store — no provider needed; subscribe via
// `useFiles((s) => s.files)`.
//
// Initial state is empty; `loadAll()` hydrates from the backend on mount, and
// broadcast events keep it in sync (no optimistic local update). Uploads are an
// HTTP POST (binary bodies stay off the socket) but still land via the
// file.created broadcast like every other mutation.

export const useFiles = create(() => ({
  folders: [],
  files: [],
  // POST /api/files — multipart { folder_id, file[] }. Resolves when stored;
  // rejects on failure so the caller can surface/clear its uploading state.
  uploadFiles: (folderId, files) => postFiles(folderId, files),
  // folder.add — { name, parent_id } (parent_id null = root)
  addFolder: ({ name, parentId }) =>
    sendCommand("folder.add", { name, parent_id: parentId }),
  // folder.delete — { folderId } (server removes the whole subtree)
  removeFolder: (folderId) =>
    sendCommand("folder.delete", { folderId }),
  // file.delete — { fileId }
  removeFile: (fileId) =>
    sendCommand("file.delete", { fileId }),
}));
