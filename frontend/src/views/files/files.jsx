import { useTranslation } from "react-i18next";
import AddButton from "../../components/buttons/add_button";
import AnimatedList from "../../components/animated_list/animated_list";
import EntryRow from "./components/entry_row";
import FolderForm from "./components/folder_form";
import FilePreview from "./components/file_preview";
import useFilesView from "./hooks/use_files";
import { formatDate } from "../../core/utils/date_utils";
import { fileKind, formatSize, KIND_FOLDER, KIND_ICONS } from "../../core/utils/file_kind";
import classes from "./files.module.css";

export default function Files() {
  const { t } = useTranslation();
  const {
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
  } = useFilesView();

  return (
    <div
      className={classes.view}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className={classes.toolbar}>
        <nav className={classes.crumbs}>
          {breadcrumbs.length === 0 ? (
            <span className={classes.crumbCurrent}>{t("files.root")}</span>
          ) : (
            <button type="button" className={classes.crumb} onClick={() => openFolder(null)}>
              {t("files.root")}
            </button>
          )}
          {breadcrumbs.map((f, i) => (
            <span key={f.id} className={classes.crumbPart}>
              <span className={classes.crumbSep}>›</span>
              {i === breadcrumbs.length - 1 ? (
                <span className={classes.crumbCurrent}>{f.name}</span>
              ) : (
                <button type="button" className={classes.crumb} onClick={() => openFolder(f.id)}>
                  {f.name}
                </button>
              )}
            </span>
          ))}
        </nav>
        <div className={classes.toolbar_right}>
          {uploading > 0 && (
            <span className={classes.status}>{t("files.uploading", { count: uploading })}</span>
          )}
          {uploadError && uploading === 0 && (
            <span className={classes.error}>{t("files.uploadFailed")}</span>
          )}
          <AddButton onClick={openFolderForm}>{t("files.newFolder")}</AddButton>
          <AddButton onClick={pickFiles}>{t("files.upload")}</AddButton>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={onPickFiles}
          />
        </div>
      </div>

      <section className={classes.block}>
        {entries.length === 0 ? (
          <div className={classes.empty}>{t("files.empty")}</div>
        ) : (
          <AnimatedList
            key={cwd ?? "root"}
            items={entries}
            getKey={(e) => e.key}
            onItemSelect={openEntry}
            renderItem={({ isFolder, item: f }, _, selected) =>
              isFolder ? (
                <EntryRow
                  icon={KIND_ICONS[KIND_FOLDER]}
                  name={f.name}
                  meta={t("files.itemsCount", { count: folderItemCounts.get(f.id) ?? 0 })}
                  selected={selected}
                  onRemove={() => deleteFolder(f)}
                  removeTitle={t("files.removeFolder")}
                />
              ) : (
                <EntryRow
                  icon={KIND_ICONS[fileKind(f.mimeType)]}
                  name={f.name}
                  meta={`${formatSize(f.size)} · ${formatDate(f.createdAt)}`}
                  selected={selected}
                  downloadHref={downloadUrl(f)}
                  downloadTitle={t("files.download")}
                  onRemove={() => deleteFile(f)}
                  removeTitle={t("files.removeFile")}
                />
              )
            }
          />
        )}
      </section>

      {dragOver && <div className={classes.drop}>{t("files.dropHint")}</div>}

      {folderFormOpen && <FolderForm onClose={closeFolderForm} onSave={saveFolder} />}
      {previewFile && (
        <FilePreview
          file={previewFile}
          src={contentUrl(previewFile)}
          downloadHref={downloadUrl(previewFile)}
          onClose={closePreview}
          onDelete={() => deleteFile(previewFile)}
        />
      )}
    </div>
  );
}
