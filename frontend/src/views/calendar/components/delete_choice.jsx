import modalClasses from "../../../components/modal/modal.module.css";
import classes from "./delete_choice.module.css";

// Delete-choice modal for a recurring event. Reuses the Modal shell's
// overlay/dialog/title/actions CSS so it reads as the same kind of dialog.
// `occurrenceStart` is the clicked instance's start (shown as a hint); `onAll`
// deletes the whole series, `onOne` excludes just this occurrence.
export default function DeleteChoice({ occurrenceStart, onAll, onOne, onClose }) {
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
        <h2 className={modalClasses.title}>Delete recurring event</h2>

        {when && (
          <p className={classes.hint}>
            This instance is on <strong>{when}</strong>. Choose what to delete.
          </p>
        )}

        <div className={modalClasses.actions}>
          <button
            type="button"
            className={`${modalClasses.delete} ${classes.danger_btn}`}
            onClick={onOne}
          >
            This occurrence
          </button>
          <div className={modalClasses.actions_right}>
            <button
              type="button"
              className={modalClasses.cancel}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`${modalClasses.delete} ${classes.danger_btn}`}
              onClick={onAll}
            >
              Entire series
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}