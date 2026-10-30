import dashboard_icon from "../assets/icons/dashboard.svg";
import calendar_icon from "../assets/icons/calendar.svg";
import checklist_icon from "../assets/icons/checklist.svg";
import files_icon from "../assets/icons/files.svg";


export const DASHBOARD_PATH = "/";
export const CALENDAR_PATH = "/calendar";
export const CHECKLIST_PATH = "/checklist";
export const FILES_PATH = "/files";

export const FEATURES = [
  { titleKey: "nav.home", path: DASHBOARD_PATH, src: dashboard_icon },
  { titleKey: "nav.calendar", path: CALENDAR_PATH, src: calendar_icon },
  { titleKey: "nav.checklist", path: CHECKLIST_PATH, src: checklist_icon },
  { titleKey: "nav.files", path: FILES_PATH, src: files_icon }
];