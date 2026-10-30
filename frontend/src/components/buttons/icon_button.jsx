import classes from "./icon_button.module.css";

// The icon is painted as a CSS mask (not an <img>), tinted via background-color.
// The Android WebView swapped <img> icons for one another on route changes when
// the dark-mode filter toggled; a mask has no image element or filter to confuse.
export default function IconButton({ src, title, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={active ? `${classes.icon_button} ${classes.active}` : classes.icon_button}
    >
      <span
        className={classes.icon}
        style={{ maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }}
        aria-hidden="true"
      />
    </button>
  );
}
