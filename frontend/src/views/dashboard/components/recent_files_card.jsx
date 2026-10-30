import { useTranslation } from "react-i18next";
import { formatDate } from "../../../core/utils/date_utils";
import { fileKind, formatSize, KIND_ICONS } from "../../../core/utils/file_kind";
import classes from "./recent_files_card.module.css";

// Most recently uploaded files (newest first). A row click deep-links to the
// files feature and opens that file's preview.
export default function RecentFilesCard({ files, onFileClick }) {
  const { t } = useTranslation();
  if (files.length === 0) {
    return <div className={classes.empty}>{t("dashboard.noRecentFiles")}</div>;
  }
  return (
    <ul className={classes.list}>
      {files.map((f) => (
        <li
          key={f.id}
          className={classes.row}
          role="button"
          tabIndex={0}
          onClick={() => onFileClick(f.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onFileClick(f.id);
            }
          }}
        >
          <span className={classes.icon} aria-hidden="true">
            {KIND_ICONS[fileKind(f.mimeType)]}
          </span>
          <div className={classes.main} title={f.name}>
            <span className={classes.name}>{f.name}</span>
            <span className={classes.meta}>
              {formatSize(f.size)} · {formatDate(f.createdAt)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
