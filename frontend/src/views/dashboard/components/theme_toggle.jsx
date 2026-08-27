import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getMode, cycleMode, subscribe } from "../../../core/theme";
import classes from "./theme_toggle.module.css";

const ICON = { light: "☀️", dark: "🌙", auto: "🌗" };

// Cycles the color mode: light → dark → auto → light. The theme module owns the
// resolved theme (stamped on <html data-theme>); this button only changes the
// *mode* and shows the mode's icon + tooltip. Subscribes to the module so the
// icon re-renders on cycle and (harmlessly) on auto sun-cache updates.
export default function ThemeToggle() {
  const { t } = useTranslation();
  const [mode, setMode] = useState(getMode);

  useEffect(() => subscribe(setMode), []);

  const label = t(`theme.${mode}`);
  return (
    <button
      type="button"
      className={classes.toggle}
      onClick={cycleMode}
      title={label}
      aria-label={label}
    >
      <span className={classes.icon} aria-hidden="true">
        {ICON[mode]}
      </span>
    </button>
  );
}