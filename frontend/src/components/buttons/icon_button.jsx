import classes from "./icon_button.module.css";

export default function IconButton({ src, title, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={active ? `${classes.icon_button} ${classes.active}` : classes.icon_button}
    >
      <img src={src} alt="" />
    </button>
  );
}