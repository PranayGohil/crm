import { SocketProvider } from "./contexts/SocketContext";

import { Routes, Route } from "react-router-dom";

import "react-toastify/dist/ReactToastify.css";

import Layout_employee from "./layout/Layout_employee";

import Plain_layout from "./layout/Plain_layout";

import EmployeeTimeTracking from "./pages/EmployeeTimeTracking";
import EmployeeNotificationPage from "./pages/EmployeeNotificationPage";

//employee
import EmployeeProfile from "./pages/EmployeeProfile";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ViewSubtask from "./pages/ViewSubtask";
import ProjectDetails from "./pages/ProjectDetails";

import Subtasks from "./pages/Subtasks";
import TimeTrackingDashboard from "./pages/TimeTrackingDashboard";
import EmployeeCompletedTasks from "./pages/EmployeeCompletedTasks";
import EmployeeActivityDashboard from "./pages/EmployeeActivityDashboard";

import ProjectMediaGallery from "./pages/ProjectMediaGallery";

import LoginPage from "./pages/LoginPage";

import ProtectedRoute from "./components/ProtectedRoute";

import NotificationSettings from "./NotificationSettings";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout_employee />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<EmployeeDashboard />} />
        <Route path="/dashboard" element={<EmployeeDashboard />} />
        <Route path="/profile" element={<EmployeeProfile />} />

        <Route path="/subtask/view/:subtaskId" element={<ViewSubtask />} />
        <Route
          path="/project/details/:projectId"
          element={<ProjectDetails />}
        />
        <Route
          path="/project/gallery/:projectId"
          element={<ProjectMediaGallery />}
        />
        <Route path="/time-tracking" element={<EmployeeTimeTracking />} />
        <Route path="/completed-tasks" element={<EmployeeCompletedTasks />} />
        <Route
          path="/activity-history"
          element={<EmployeeActivityDashboard />}
        />
        <Route path="/notifications" element={<EmployeeNotificationPage />} />

        <Route path="/subtasks" element={<Subtasks />} />
        <Route path="/team-time-tracking" element={<TimeTrackingDashboard />} />

        <Route
          path="/notification-settings"
          element={<NotificationSettings />}
        />
      </Route>

      <Route path="/" element={<Plain_layout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
    </Routes>
  );
}

export default App;
