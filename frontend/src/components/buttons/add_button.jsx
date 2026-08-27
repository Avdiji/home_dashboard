import { useTranslation } from "react-i18next";
import classes from "./add_button.module.css";

export default function AddButton(props) {
  const { t } = useTranslation();
  const { onClick, children = t("common.add"), variant, size, disabled } = props;

  const cls = [classes.add_button];
  if (variant && classes[variant]) cls.push(classes[variant]);
  if (size && classes[size]) cls.push(classes[size]);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cls.join(" ")}
    >
      {children}
    </button>
  );
}