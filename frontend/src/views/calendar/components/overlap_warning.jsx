import { useTranslation } from "react-i18next";
import { formatDate, formatTime } from "../../../core/utils/date_utils";
import modalClasses from "../../../components/modal/modal.module.css";
import classes from "./overlap_warning.module.css";

// Confirmation modal shown when the event being saved overlaps one or more
// existing occurrences. Reuses the Modal shell's overlay/dialog/title/actions
// CSS. `onConfirm` saves anyway; `onClose` cancels and returns to the form.
export default function OverlapWarning({ conflicts, onConfirm, onClose }) {
  const { t } = useTranslation();
  const stop = (e) => e.stopPropagation();

  return (
    <div className={modalClasses.overlay} onClick={onClose}>
      <div className={modalClasses.dialog} onClick={stop}>
        <h2 className={modalClasses.title}>{t("calendar.overlapWarningTitle")}</h2>
        <p className={classes.hint}>{t("calendar.overlapWarningHint")}</p>

        <ul className={classes.list}>
          {conflicts.map((c, i) => (
            <li key={`${c.event.id}-${c.start.toISOString()}-${i}`} className={classes.item}>
              <span className={classes.item_title}>{c.event.title}</span>
              <span className={classes.item_time}>
                {formatDate(c.start)} · {formatTime(c.start)} – {formatTime(c.end)}
              </span>
            </li>
          ))}
        </ul>

        <div className={modalClasses.actions}>
          <div className={modalClasses.actions_right}>
            <button type="button" className={modalClasses.cancel} onClick={onClose}>
              {t("common.cancel")}
            </button>
            <button type="button" className={modalClasses.save} onClick={onConfirm}>
              {t("calendar.saveAnyway")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
