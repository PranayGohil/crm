import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "react-toastify/dist/ReactToastify.css";

import Layout from "./layout/Layout";

import Plain_layout from "./layout/Plain_layout";

import DashboardOverview from "./pages/admin-panel/DashboardOverview";

import ClientDashboardPage from "./pages/admin-panel/client/ClientDashboardPage";
import CreateNewClient from "./pages/admin-panel/client/CreateNewClient";
import ClientDetailsPage from "./pages/admin-panel/client/ClientDetailsPage";
import ClientProjectDetails from "./pages/admin-panel/client/ClientProjectDetails";

import ProjectDetails from "./pages/admin-panel/project/ProjectDetails";

import AllProject from "./pages/admin-panel/project/AllProject";
import AddNewProject from "./pages/admin-panel/project/AddNewProject";
import AddSubtask from "./pages/admin-panel/subtask/AddSubtask";
import SubtaskDashboardContainer from "./pages/admin-panel/subtask/SubtaskDashboardContainer";

import ProjectMediaGallery from "./pages/admin-panel/ProjectMediaGallery";

import EmployeeDashboard from "./pages/admin-panel/employee/EmployeeDashboard";
import EmployeeProfileEdit from "./pages/admin-panel/employee/EmployeeProfileEdit";
import TeamMemberProfile from "./pages/admin-panel/employee/TeamMemberProfile";
import EmployeeTimeTracking from "./pages/admin-panel/employee/EmployeeTimeTracking";
import Subtasks from "./pages/admin-panel/subtask/Subtasks";
import NotificationAdmin from "./pages/admin-panel/NotificationAdmin";

import EditClient from "./pages/admin-panel/client/EditClient";
import EditProject from "./pages/admin-panel/project/EditProject";

import EditSubtask from "./pages/admin-panel/subtask/EditSubtask";
import UpcomingDueDatesPage from "./pages/admin-panel/UpcomingDueDatesPage";
import CreateEmployeeProfile from "./pages/admin-panel/employee/CreateEmployeeProfile";

import TimeTrackingDashboard from "./pages/admin-panel/TimeTrackingDashboard";

import LoginPage from "./pages/admin-panel/LoginPage";

import ViewSubtask from "./pages/admin-panel/subtask/ViewSubtask";

import ProtectedRoute from "./components/admin/ProtectedRoute";

import Designation from "./pages/admin-panel/Designation";
import Department from "./pages/admin-panel/Department";

import AdminProfile from "./pages/admin-panel/AdminProfile";

import ArchivedProjects from "./pages/admin-panel/project/ArchivedProjects";

import SubtaskLogs from "./pages/admin-panel/subtask/SubtaskLogs";

import NotificationSettings from "./NotificationSettings";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Protected routes */}
        <Route path="/" element={<DashboardOverview />} />
        <Route index element={<DashboardOverview />} />
        <Route path="/dashboard" element={<DashboardOverview />} />
        <Route path="/admin/profile" element={<AdminProfile />} />

        {/* client */}
        <Route path="/client/dashboard" element={<ClientDashboardPage />} />
        <Route path="/client/create" element={<CreateNewClient />} />
        <Route path="/client/details/:id" element={<ClientDetailsPage />} />
        <Route path="/client/edit/:id" element={<EditClient />} />

        <Route
          path="/client/projects/:username"
          element={<ClientProjectDetails />}
        />

        <Route
          path="/project/details/:projectId"
          element={<ProjectDetails />}
        />
        <Route path="/project/dashboard" element={<AllProject />} />
        <Route path="/project/add" element={<AddNewProject />} />
        <Route
          path="/project/subtask/add/:projectId"
          element={<AddSubtask />}
        />
        <Route
          path="/project/subtask-dashboard/:projectId"
          element={<SubtaskDashboardContainer />}
        />

        <Route path="/subtask/view/:subtaskId" element={<ViewSubtask />} />
        <Route
          path="/subtask/upcoming-due-dates"
          element={<UpcomingDueDatesPage />}
        />
        <Route
          path="/project/gallery/:projectId"
          element={<ProjectMediaGallery />}
        />
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route
          path="/employee/edit/:employeeId"
          element={<EmployeeProfileEdit />}
        />
        <Route path="/employee/profile/:id" element={<TeamMemberProfile />} />
        <Route
          path="/employee/timetracking/:id"
          element={<EmployeeTimeTracking />}
        />
        <Route path="/subtasks" element={<Subtasks />} />
        <Route path="/time-tracking" element={<TimeTrackingDashboard />} />
        <Route path="/notifications" element={<NotificationAdmin />} />

        {/* edit page */}

        <Route path="/project/edit/:projectId" element={<EditProject />} />

        <Route
          path="/project/subtask/edit/:subtaskId"
          element={<EditSubtask />}
        />
        <Route
          path="/employee/create-profile"
          element={<CreateEmployeeProfile />}
        />
        <Route path="/designation" element={<Designation />} />
        <Route path="/department" element={<Department />} />

        <Route path="/archived-projects" element={<ArchivedProjects />} />

        <Route path="/subtask/logs/:subtaskId" element={<SubtaskLogs />} />

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
