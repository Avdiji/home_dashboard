import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import classes from "./feature_panel.module.css";

import IconButton from "../buttons/icon_button";
import { FEATURES } from "../../core/nav_config";

// Active feature is derived from the current route, not held in local state —
// so it stays correct on a full page reload (e.g. reloading /calendar keeps
// Calendar active) and when another view navigates via useNavigate (e.g. the
// dashboard's upcoming/dish deep-links jumping to /calendar or /meals).
const activeIndex = (pathname) => {
  let best = 0;
  let bestLen = 0;
  FEATURES.forEach((f, i) => {
    const p = f.path;
    const matches =
      p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(p + "/");
    if (matches && p.length > bestLen) {
      best = i;
      bestLen = p.length;
    }
  });
  return best;
};

export default function FeaturePanel() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const selected = useMemo(() => activeIndex(pathname), [pathname]);

  return (
    <nav className={classes.feature_panel}>
      {FEATURES.map((f, i) => (
        <IconButton
          key={f.title}
          src={f.src}
          title={f.title}
          active={selected === i}
          onClick={() => nav(f.path)}
        />
      ))}
    </nav>
  );
}