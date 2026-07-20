import classes from "./remove_button.module.css";

export default function RemoveButton({
  onClick,
  title,
  size = "md",
  className,
  children = "✕",
}) {
  const cls = [classes.remove_button];
  if (classes[size]) cls.push(classes[size]);
  if (className) cls.push(className);
  return (
    <button type="button" className={cls.join(" ")} onClick={onClick} title={title}>
      {children}
    </button>
  );
}