import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  fileKind,
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
      <div className={classes.dialog} role="dialog" aria-label={file.name} onClick={(e) => e.stopPropagation()}>
        <div className={classes.body}>
          <PreviewBody file={file} src={src} downloadHref={downloadHref} />
        </div>
        <div className={classes.actions}>
          <a className={classes.action} href={downloadHref} download title={t("files.download")} aria-label={t("files.download")}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
            </svg>
          </a>
          <button type="button" className={`${classes.action} ${classes.delete}`} onClick={onDelete} title={t("files.delete")} aria-label={t("files.delete")}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
