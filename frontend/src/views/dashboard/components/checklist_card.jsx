import { CHECKLIST_GLANCE_LIMIT } from "../../../core/constants";
import classes from "./checklist_card.module.css";

// View-only checklist glance for the dashboard. Up to CHECKLIST_GLANCE_LIMIT lists
// laid out horizontally so the row fills the card width. Each cell shows the list title,
// a progress bar (done/total), and the remaining count. The whole card is a
// link to the checklist feature — no per-item interaction here (view-only).
export default function ChecklistCard({ lists, onOpen }) {
  if (!lists || lists.length === 0) {
    return <div className={classes.empty}>No lists yet</div>;
  }
  const activate = () => onOpen?.();
  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activate();
    }
  };
  return (
    <div
      className={classes.card}
      role="button"
      tabIndex={0}
      onClick={activate}
      onKeyDown={onKeyDown}
    >
      <div className={classes.grid}>
        {lists.slice(0, CHECKLIST_GLANCE_LIMIT).map((l) => (
          <div key={l.id} className={classes.cell}>
            <div className={classes.title}>{l.title}</div>
            <div className={classes.bar}>
              <div className={classes.fill} style={{ width: `${l.pct}%` }} />
            </div>
            <div className={classes.foot}>
              <span className={classes.done}>
                {l.done}/{l.total}
              </span>
              <span className={classes.left}>{l.remaining} left</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}