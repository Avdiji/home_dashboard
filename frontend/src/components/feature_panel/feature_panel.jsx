import { useState } from "react";
import classes from "./feature_panel.module.css";

import home_icon from "../../assets/icons/home.svg";
import calendar_icon from "../../assets/icons/calendar.svg";
import shopping_cart_icon from "../../assets/icons/shopping_cart.svg";
import todo_list_icon from "../../assets/icons/todo_list.svg";
import IconButton from "../buttons/icon_button";
import {
  CALENDAR_PATH,
  DASHBOARD_PATH,
  SHOPPING_PATH,
  TODO_PATH,

  FEATURES,
} from "../../core/constants";
import { useNavigate } from "react-router-dom";

export default function FeaturePanel() {
  const [selected, setSelected] = useState(0);
  const nav = useNavigate();

  const onClick = (index, target_path) => {
    setSelected(index);
    nav(target_path);
  };

  return (
    <nav className={classes.feature_panel}>
      {FEATURES.map((f, i) => (
        <IconButton
          key={f.title}
          src={f.src}
          title={f.title}
          active={selected === i}
          onClick={() => onClick(i, f.path)}
        />
      ))}
    </nav>
  );
}
