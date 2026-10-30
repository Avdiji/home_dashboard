import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/layout";
import Dashboard from "./views/dashboard/dashboard";

import {CALENDAR_PATH, DASHBOARD_PATH, CHECKLIST_PATH, FILES_PATH} from "./core/nav_config";
import Calendar from "./views/calendar/calendar";
import Checklist from "./views/checklist/checklist";
import Files from "./views/files/files";
import { initRealtime } from "./core/api/init";

export default function App() {
  // Boot the realtime layer once: open the WS, register the event reducer, and
  // hydrate the stores from REST. initRealtime is idempotent so StrictMode's
  // double-mount does not open a second socket.
  useEffect(() => {
    initRealtime();
  }, []);

  return(
    <Router>
      <Layout>
        <Routes>
          <Route path={DASHBOARD_PATH} element={<Dashboard/>}/>
          <Route path={CALENDAR_PATH} element={<Calendar/>}/>
          <Route path={CHECKLIST_PATH} element={<Checklist/>}/>
          <Route path={FILES_PATH} element={<Files/>}/>
        </Routes>
      </Layout>
    </Router>
  );
}