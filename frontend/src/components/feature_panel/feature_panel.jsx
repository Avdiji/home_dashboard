import { useState } from "react";
import classes from "./feature_panel.module.css";

import calendar_icon from "../../assets/icons/calendar.svg";
import shopping_cart_icon from "../../assets/icons/shopping_cart.svg";
import IconButton from "../buttons/icon_button";

const FEATURES = [
  { title: "Home", src: calendar_icon },
  { title: "Calendar", src: calendar_icon },
  { title: "Shopping Lists", src: shopping_cart_icon },
  { title: "Todos", src: calendar_icon },
];

export default function FeaturePanel() {
  const [selected, setSelected] = useState(0);

  return (
    <nav className={classes.feature_panel}>
      {FEATURES.map((f, i) => (
        <IconButton
          key={f.title}
          src={f.src}
          title={f.title}
          active={selected === i}
          onClick={() => setSelected(i)}
        />
      ))}
    </nav>
  );
}