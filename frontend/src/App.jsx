import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./views/dashboard/dashboard";

import {CALENDAR_PATH, DASHBOARD_PATH, CHECKLIST_PATH, MEAL_PLAN_PATH} from "./core/nav_config";
import Calendar from "./views/calendar/calendar";
import Checklist from "./views/checklist/checklist";
import MealPlan from "./views/meal_plan/meal_plan";

export default function App() {
  return(
    <Router>
      <Layout>
        <Routes>
          <Route path={DASHBOARD_PATH} element={<Dashboard/>}/>
          <Route path={CALENDAR_PATH} element={<Calendar/>}/>
          <Route path={CHECKLIST_PATH} element={<Checklist/>}/>
          <Route path={MEAL_PLAN_PATH} element={<MealPlan/>}/>
        </Routes>
      </Layout>
    </Router>
  );
}