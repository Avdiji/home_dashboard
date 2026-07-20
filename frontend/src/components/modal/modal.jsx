import classes from "./modal.module.css";

export default function Modal({
  title,
  onClose,
  onSave,
  saveDisabled = false,
  onDelete,
  children,
  className,
}) {
  return (
    <div className={classes.overlay} onClick={onClose}>
      <div
        className={`${classes.dialog}${className ? ` ${className}` : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={classes.title}>{title}</h2>
        {children}
        <div className={classes.actions}>
          {onDelete && (
            <button type="button" className={classes.delete} onClick={onDelete}>
              Delete
            </button>
          )}
          <div className={classes.actions_right}>
            <button type="button" className={classes.cancel} onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className={classes.save}
              onClick={onSave}
              disabled={saveDisabled}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}