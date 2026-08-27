import { useTranslation } from "react-i18next";
import classes from "./dish_card.module.css";

export default function DishCard({ dish, onClick }) {
  const { t } = useTranslation();
  if (!dish) {
    return (
      <div className={classes.empty}>
        <div className={classes.hero}>🍽️</div>
        <div className={classes.emptyText}>{t("dashboard.nothingPlannedToday")}</div>
      </div>
    );
  }
  const r = dish.recipe;
  const clickable = onClick && r;
  return (
    <div
      className={`${classes.wrap}${clickable ? ` ${classes.clickable}` : ""}`}
      onClick={clickable ? () => onClick(r.id) : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick(r.id);
              }
            }
          : undefined
      }
    >
      <div className={classes.hero}>🍽️</div>
      <div className={classes.name}>{dish.label}</div>
      {r && (r.servings != null || r.minutes != null) && (
        <div className={classes.badges}>
          {r.servings != null && (
            <span className={classes.badge}>{t("dashboard.servings", { count: r.servings })}</span>
          )}
          {r.minutes != null && (
            <span className={classes.badge}>{t("dashboard.minutesShort", { count: r.minutes })}</span>
          )}
        </div>
      )}
      {r?.description && <div className={classes.desc}>{r.description}</div>}
    </div>
  );
}