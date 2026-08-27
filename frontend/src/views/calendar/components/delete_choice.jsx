import { useTranslation, Trans } from "react-i18next";
import modalClasses from "../../../components/modal/modal.module.css";
import classes from "./delete_choice.module.css";

// Delete-choice modal for a recurring event. Reuses the Modal shell's
// overlay/dialog/title/actions CSS so it reads as the same kind of dialog.
// `occurrenceStart` is the clicked instance's start (shown as a hint); `onAll`
// deletes the whole series, `onOne` excludes just this occurrence.
export default function DeleteChoice({ occurrenceStart, onAll, onOne, onClose }) {
  const { t } = useTranslation();
  const when = occurrenceStart
    ? new Date(occurrenceStart).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const stop = (e) => e.stopPropagation();

  return (
    <div className={modalClasses.overlay} onClick={onClose}>
      <div className={modalClasses.dialog} onClick={stop}>
        <h2 className={modalClasses.title}>{t("calendar.deleteRecurringTitle")}</h2>

        {when && (
          <p className={classes.hint}>
            <Trans i18nKey="calendar.deleteRecurringHint" components={{ bold: <strong /> }} values={{ when }} />
          </p>
        )}

        <div className={modalClasses.actions}>
          <button
            type="button"
            className={`${modalClasses.delete} ${classes.danger_btn}`}
            onClick={onOne}
          >
            {t("calendar.thisOccurrence")}
          </button>
          <div className={modalClasses.actions_right}>
            <button
              type="button"
              className={modalClasses.cancel}
              onClick={onClose}
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              className={`${modalClasses.delete} ${classes.danger_btn}`}
              onClick={onAll}
            >
              {t("calendar.entireSeries")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}