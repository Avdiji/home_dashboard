// File bytes travel over HTTP, not the websocket: uploads are multipart POSTs
// and previews/downloads are plain URLs the browser loads directly (iframe,
// img, video, <a download>). The resulting file.created broadcast still comes
// back over the socket and is folded in by applyEvent like any other entity.

import { API_BASE, API_ENDPOINTS } from "../constants";

// uploadFiles POSTs the files as multipart/form-data. folder_id goes first so
// the server knows the target folder before it streams the file parts.
export async function postFiles(folderId, files) {
  const body = new FormData();
  body.append("folder_id", folderId ?? "");
  for (const f of files) body.append("file", f, f.name);
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.files}`, { method: "POST", body });
  if (!res.ok) throw new Error(`upload failed: ${res.status} ${await res.text()}`);
  return res.json();
}

// fileContentUrl is the inline (previewable) URL; `download` forces an
// attachment so the browser saves it instead of rendering it.
export const fileContentUrl = (fileId, { download = false } = {}) =>
  `${API_BASE}${API_ENDPOINTS.files}/${fileId}/content${download ? "?download=1" : ""}`;
