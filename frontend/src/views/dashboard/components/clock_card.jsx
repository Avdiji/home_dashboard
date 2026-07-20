import Card from "../../../components/cards/card";
import classes from "./clock_card.module.css";

export default function ClockCard({ clock }) {
  return (
    <Card title={clock.weekday}>
      <div className={classes.time}>{clock.time}</div>
      <div className={classes.date}>{clock.date}</div>
    </Card>
  );
}