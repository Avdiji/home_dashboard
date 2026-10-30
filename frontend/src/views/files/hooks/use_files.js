import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFiles } from "../../../store/files_store";
import { fileContentUrl } from "../../../core/api/files";
import { transition } from "../../../core/utils/view_transition";
import { FILES_PATH } from "../../../core/nav_config";
import { STATE_KEY_PREVIEW_FILE_ID } from "../../../core/constants";

const byName = (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true });

// Named useFilesView (not useFiles) so it doesn't collide with the
// `useFiles` store it reads from.
export default function useFilesView() {
  const { t } = useTranslation();
  // Entity state lives in the centralized store; folder.delete / file.delete /
  // upload broadcasts from any client update it here.
  const folders = useFiles((s) => s.folders);
  const files = useFiles((s) => s.files);
  const uploadFiles = useFiles((s) => s.uploadFiles);
  const addFolder = useFiles((s) => s.addFolder);
  const removeFolder = useFiles((s) => s.removeFolder);
  const removeFile = useFiles((s) => s.removeFile);

  const [folderId, setFolderId] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [folderFormOpen, setFolderFormOpen] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // The open folder may be deleted by another client — fall back to root.
  const cwd = folders.some((f) => f.id === folderId) ? folderId : null;
  // Same for the previewed file: derive it from the store so it closes itself.
  const previewFile = files.find((f) => f.id === previewId) ?? null;

  const breadcrumbs = useMemo(() => {
    const byId = new Map(folders.map((f) => [f.id, f]));
    const path = [];
    const seen = new Set();
    for (let f = byId.get(cwd); f && !seen.has(f.id); f = byId.get(f.parentId)) {
      seen.add(f.id);
      path.unshift(f);
    }
    return path;
  }, [folders, cwd]);

  const childFolders = useMemo(
    () => folders.filter((f) => f.parentId === cwd).sort(byName),
    [folders, cwd]
  );
  const childFiles = useMemo(
    () => files.filter((f) => f.folderId === cwd).sort(byName),
    [files, cwd]
  );

  // One list for the AnimatedList: folders first, then files. `key` is unique
  // across both kinds (ids come from separate tables).
  const entries = useMemo(
    () => [
      ...childFolders.map((f) => ({ key: `d${f.id}`, isFolder: true, item: f })),
      ...childFiles.map((f) => ({ key: `f${f.id}`, isFolder: false, item: f })),
    ],
    [childFolders, childFiles]
  );

  // Direct child count per folder, shown as the folder row's meta.
  const folderItemCounts = useMemo(() => {
    const counts = new Map();
    const bump = (id) => id != null && counts.set(id, (counts.get(id) ?? 0) + 1);
    folders.forEach((f) => bump(f.parentId));
    files.forEach((f) => bump(f.folderId));
    return counts;
  }, [folders, files]);

  const openFolder = (id) => transition(() => setFolderId(id));
  const openPreview = (file) => transition(() => setPreviewId(file.id));
  const closePreview = () => transition(() => setPreviewId(null));
  const openEntry = (entry) => (entry.isFolder ? openFolder(entry.item.id) : openPreview(entry.item));
  const openFolderForm = () => transition(() => setFolderFormOpen(true));
  const closeFolderForm = () => transition(() => setFolderFormOpen(false));

  const saveFolder = (name) => addFolder({ name, parentId: cwd });

  const upload = (fileList) => {
    const list = [...(fileList ?? [])];
    if (!list.length) return;
    setUploadError(false);
    setUploading((n) => n + list.length);
    uploadFiles(cwd, list)
      .catch((e) => {
        console.error(e);
        setUploadError(true);
      })
      .finally(() => setUploading((n) => n - list.length));
  };

  const pickFiles = () => fileInputRef.current?.click();
  const onPickFiles = (e) => {
    upload(e.target.files);
    e.target.value = ""; // allow re-picking the same file
  };

  // Drag & drop onto the view. Only react to real file drags (not text/links).
  const isFileDrag = (e) => [...(e.dataTransfer?.types ?? [])].includes("Files");
  const onDragOver = (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    if (!dragOver) setDragOver(true);
  };
  const onDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false);
  };
  const onDrop = (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    setDragOver(false);
    upload(e.dataTransfer.files);
  };

  // Deletes are irreversible (bytes are gone), so both ask first.
  const deleteFile = (file) => {
    if (!window.confirm(t("files.confirmDeleteFile", { name: file.name }))) return;
    removeFile(file.id);
  };
  const deleteFolder = (folder) => {
    if (!window.confirm(t("files.confirmDeleteFolder", { name: folder.name }))) return;
    removeFolder(folder.id);
  };

  // Cross-feature deep link: the dashboard's recent files list navigates here
  // with `{ previewFileId }` — open the file's folder and its preview. Waits
  // for the file to be in the store (a cold load hydrates after mount).
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const id = location.state?.[STATE_KEY_PREVIEW_FILE_ID];
    if (id == null) return;
    const found = files.find((f) => f.id === id);
    if (!found) return;
    setFolderId(found.folderId);
    transition(() => setPreviewId(found.id));
    // Consume the state so a back/forward re-entry doesn't reopen the preview.
    navigate(FILES_PATH, { replace: true, state: null });
  }, [location.state, files, navigate]);

  const contentUrl = (file) => fileContentUrl(file.id);
  const downloadUrl = (file) => fileContentUrl(file.id, { download: true });

  return {
    cwd,
    breadcrumbs,
    entries,
    folderItemCounts,
    previewFile,
    folderFormOpen,
    uploading,
    uploadError,
    dragOver,
    fileInputRef,
    openFolder,
    openEntry,
    closePreview,
    openFolderForm,
    closeFolderForm,
    saveFolder,
    pickFiles,
    onPickFiles,
    onDragOver,
    onDragLeave,
    onDrop,
    deleteFile,
    deleteFolder,
    contentUrl,
    downloadUrl,
  };
}
