import RemoveButton from "../../../components/buttons/remove_button";
import classes from "./entry_row.module.css";

// One row in the file browser — a folder or a file. Rendered inside
// AnimatedList, which owns click/Enter → open (enter folder / preview file)
// and the selected state; the row's own buttons stop propagation so they
// don't also open it. Files get a download link.
export default function EntryRow({
  icon,
  name,
  meta,
  selected,
  downloadHref,
  downloadTitle,
  onRemove,
  removeTitle,
}) {
  const stop = (e) => e.stopPropagation();
  return (
    <div className={`${classes.row}${selected ? ` ${classes.selected}` : ""}`}>
      <span className={classes.icon} aria-hidden="true">{icon}</span>
      <div className={classes.main} title={name}>
        <span className={classes.name}>{name}</span>
        {meta && <span className={classes.meta}>{meta}</span>}
      </div>
      {downloadHref && (
        <a
          className={classes.download}
          href={downloadHref}
          download
          title={downloadTitle}
          onClick={stop}
        >
          ⬇
        </a>
      )}
      <RemoveButton
        title={removeTitle}
        size="sm"
        onClick={(e) => {
          stop(e);
          onRemove();
        }}
      />
    </div>
  );
}
