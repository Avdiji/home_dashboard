import FeaturePanel from "../feature_panel/feature_panel";
import classes from "./layout.module.css";

export default function Layout(props) {
  return (
    <div className={classes.layout}>
      <FeaturePanel />
      <div className={classes.content}>{props.children}</div>
    </div>
  );
}
