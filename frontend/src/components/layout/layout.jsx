import FeaturePanel from "../feature_panel/feature_panel";
import classes from "./layout.module.css";

export default function Layout(props) {
  return (
    <div className={classes.layout}>
        
      <div className={classes.sidebar}>
        <FeaturePanel />
      </div>

      <main className={classes.content}>{props.children}</main>
      
      <div className={classes.bottombar}>
        <FeaturePanel />
      </div>
    
    </div>
  );
}
