import classes from "./feature_panel.module.css";

import calendar_icon from "../../assets/icons/calendar.svg";
import IconButton from "../buttons/icon_button";

export default function FeaturePanel() {
  return (
    <nav className={classes.feature_panel}>
      <IconButton src={calendar_icon} />
      <IconButton src={calendar_icon} />
      <IconButton src={calendar_icon} />
      <IconButton src={calendar_icon} />
    </nav>
  );
}
