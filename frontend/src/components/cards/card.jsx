import classes from "./card.module.css";

export default function Card(props) {
  const { title, badge, headerActions, children } = props;

  return (
    <div className={classes.card}>
      <h2 className={classes.header}>
        <span className={classes.title}>{title}</span>
        <span className={classes.spacer} />
        {badge && <span className={classes.badge}>{badge}</span>}
        {headerActions}
      </h2>
      {children}
    </div>
  );
}