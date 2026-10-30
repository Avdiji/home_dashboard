import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  fileKind,
  formatSize,
  KIND_AUDIO,
  KIND_HTML,
  KIND_ICONS,
  KIND_IMAGE,
  KIND_PDF,
  KIND_TEXT,
  KIND_VIDEO,
} from "../../../core/utils/file_kind";
import classes from "./file_preview.module.css";

// Full-size in-browser viewer. The browser renders the file itself from its
// content URL: PDFs via the built-in PDF viewer (iframe — must NOT be
// sandboxed or Chrome refuses to render it), HTML in a sandboxed iframe (its
// own opaque origin; the server also sends a CSP sandbox), text in a
// script-less iframe, media in native players. Anything else offers a download.
function PreviewBody({ file, src, downloadHref }) {
  const { t } = useTranslation();
  switch (fileKind(file.mimeType)) {
    case KIND_PDF:
      return <iframe className={classes.frame} src={src} title={file.name} />;
    case KIND_HTML:
      return <iframe className={classes.frame} src={src} title={file.name} sandbox="allow-scripts" />;
    case KIND_TEXT:
      return <iframe className={classes.frame} src={src} title={file.name} sandbox="" />;
    case KIND_IMAGE:
      return <img className={classes.media} src={src} alt={file.name} />;
    case KIND_VIDEO:
      return <video className={classes.media} src={src} controls autoPlay />;
    case KIND_AUDIO:
      return <audio className={classes.audio} src={src} controls autoPlay />;
    default:
      return (
        <div className={classes.none}>
          <span className={classes.noneIcon}>{KIND_ICONS[fileKind(file.mimeType)]}</span>
          <span>{t("files.noPreview")}</span>
          <a className={classes.btnPrimary} href={downloadHref} download>
            {t("files.download")}
          </a>
        </div>
      );
  }
}

export default function FilePreview({ file, src, downloadHref, onClose, onDelete }) {
  const { t } = useTranslation();

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className={classes.overlay} onClick={onClose}>
      <div className={classes.dialog} onClick={(e) => e.stopPropagation()}>
        <header className={classes.header}>
          <span className={classes.icon} aria-hidden="true">{KIND_ICONS[fileKind(file.mimeType)]}</span>
          <div className={classes.titles}>
            <h2 className={classes.title} title={file.name}>{file.name}</h2>
            <span className={classes.meta}>{formatSize(file.size)}</span>
          </div>
          <div className={classes.actions}>
            <a className={classes.btn} href={downloadHref} download>
              {t("files.download")}
            </a>
            <button type="button" className={`${classes.btn} ${classes.danger}`} onClick={onDelete}>
              {t("files.delete")}
            </button>
            <button type="button" className={classes.close} onClick={onClose} title={t("files.close")}>
              ✕
            </button>
          </div>
        </header>
        <div className={classes.body}>
          <PreviewBody file={file} src={src} downloadHref={downloadHref} />
        </div>
      </div>
    </div>
  );
}
