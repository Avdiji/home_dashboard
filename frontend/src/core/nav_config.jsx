import dashboard_icon from "../assets/icons/dashboard.svg";
import calendar_icon from "../assets/icons/calendar.svg";
import shopping_cart_icon from "../assets/icons/shopping_cart.svg";
import todo_list_icon from "../assets/icons/todo_list.svg";


export const DASHBOARD_PATH = "/";
export const CALENDAR_PATH = "/calendar";
export const SHOPPING_PATH = "/shopping";
export const TODO_PATH = "/todo";

export const FEATURES = [
  { title: "Home", path: DASHBOARD_PATH, src: dashboard_icon },
  { title: "Calendar", path: CALENDAR_PATH, src: calendar_icon },
  { title: "Shopping Lists", path: SHOPPING_PATH, src: shopping_cart_icon },
  { title: "Todos", path: TODO_PATH, src: todo_list_icon }
];