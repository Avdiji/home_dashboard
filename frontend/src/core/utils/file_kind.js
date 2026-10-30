// File helpers: how a mime type previews in the browser, its row icon, and a
// human-readable size. Used by the files feature and the dashboard's recent
// files glance.

export const KIND_FOLDER = "folder";
export const KIND_PDF = "pdf";
export const KIND_HTML = "html";
export const KIND_TEXT = "text";
export const KIND_IMAGE = "image";
export const KIND_VIDEO = "video";
export const KIND_AUDIO = "audio";
export const KIND_OTHER = "other";

const TEXT_TYPES = new Set([
  "application/json",
  "application/xml",
  "application/javascript",
  "application/x-yaml",
  "application/yaml",
]);

export function fileKind(mimeType = "") {
  const base = mimeType.split(";")[0].trim().toLowerCase();
  if (base === "application/pdf") return KIND_PDF;
  if (base === "text/html" || base === "application/xhtml+xml") return KIND_HTML;
  if (base.startsWith("image/")) return KIND_IMAGE;
  if (base.startsWith("video/")) return KIND_VIDEO;
  if (base.startsWith("audio/")) return KIND_AUDIO;
  if (base.startsWith("text/") || TEXT_TYPES.has(base)) return KIND_TEXT;
  return KIND_OTHER;
}

export const KIND_ICONS = {
  [KIND_FOLDER]: "📁",
  [KIND_PDF]: "📕",
  [KIND_HTML]: "🌐",
  [KIND_TEXT]: "📝",
  [KIND_IMAGE]: "🖼️",
  [KIND_VIDEO]: "🎬",
  [KIND_AUDIO]: "🎵",
  [KIND_OTHER]: "📄",
};

const UNITS = ["B", "KB", "MB", "GB"];

export function formatSize(bytes) {
  let n = bytes;
  let u = 0;
  while (n >= 1024 && u < UNITS.length - 1) {
    n /= 1024;
    u++;
  }
  return `${u === 0 ? n : n.toFixed(n < 10 ? 1 : 0)} ${UNITS[u]}`;
}
