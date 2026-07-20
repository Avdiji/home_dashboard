import classes from "./page_header.module.css";

export default function PageHeader({ title, subtitle }) {
  return (
    <h1 className={classes.page_title}>
      {title}
      {subtitle && <div className={classes.page_sub}>{subtitle}</div>}
    </h1>
  );
}