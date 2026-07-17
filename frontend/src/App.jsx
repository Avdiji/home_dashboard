import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./views/dashboard/dashboard";

import {CALENDAR_PATH, DASHBOARD_PATH, SHOPPING_PATH, TODO_PATH} from "./core/nav_config";
import Calendar from "./views/calendar/calendar";
import ShoppingList from "./views/shopping_list/shopping_list";
import TodoList from "./views/todo_list/todo_list";

export default function App() {
  return(
    <Router>
      <Layout>
        <Routes>
          <Route path={DASHBOARD_PATH} element={<Dashboard/>}/>
          <Route path={CALENDAR_PATH} element={<Calendar/>}/>
          <Route path={SHOPPING_PATH} element={<ShoppingList/>}/>
          <Route path={TODO_PATH} element={<TodoList/>}/>
        </Routes>
      </Layout>
    </Router>
  );
}