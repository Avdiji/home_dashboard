import dashboard_icon from "../assets/icons/dashboard.svg";
import calendar_icon from "../assets/icons/calendar.svg";
import checklist_icon from "../assets/icons/checklist.svg";


export const DASHBOARD_PATH = "/";
export const CALENDAR_PATH = "/calendar";
export const CHECKLIST_PATH = "/checklist";

export const FEATURES = [
  { title: "Home", path: DASHBOARD_PATH, src: dashboard_icon },
  { title: "Calendar", path: CALENDAR_PATH, src: calendar_icon },
  { title: "Checklist", path: CHECKLIST_PATH, src: checklist_icon }
];