import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Layout from "./layout/Layout";
import Layout_employee from "./layout/Layout_employee";
import Layout_client from "./layout/Layout_client";

import Plain_layout from "./layout/Plain_layout";

import DashboardOverview from "./pages/admin-panel/DashboardOverview";

import ClientDashboardPage from "./pages/admin-panel/client/ClientDashboardPage";
import CreateNewClient from "./pages/admin-panel/client/CreateNewClient";
import ClientDetailsPage from "./pages/admin-panel/client/ClientDetailsPage";
import ClientProjectDetails from "./pages/ClientProjectDetails";
import ClientSubtaskShow from "./pages/ClientSubtaskShow";

import ProjectDetails from "./pages/ProjectDetails";

import AllProject from "./pages/admin-panel/project/AllProject";
import AddNewProject from "./pages/admin-panel/project/AddNewProject";
import SubtaskManagement from "./pages/SubtaskManagement";
import AddSubtask from "./pages/admin-panel/subtask/AddSubtask";
import SubtaskDashboardContainer from "./pages/admin-panel/subtask/SubtaskDashboardContainer";

import ProjectContent from "./pages/admin-panel/project/ProjectContent";
import EditProjectContent from "./pages/EditProjectContent";
import ProjectMediaGallery from "./components/ProjectMediaGallery";

import TeamMemberDashboard from "./pages/TeamMemberDashboard";
import EmployeeProfileEdit from "./pages/EmployeeProfileEdit";
import TeamMemberProfile from "./pages/TeamMemberProfile";
import TaskTimeboard from "./pages/TaskTimeboard";
import NotificationAdmin from "./pages/NotificationAdmin";

import EditClient from "./pages/admin-panel/client/EditClient";
import EditProject from "./pages/EditProject";
import CreateProjectContent from "./pages/admin-panel/project/CreateProjectContent";
import EditSubtask from "./pages/admin-panel/subtask/EditSubtask";
import CreateEmployeeProfile from "./pages/CreateEmployeeProfile";

import TimeTrackingDashboard from "./pages/TimeTrackingDashboard";
import EmployeeTimeTracking from "./pages/EmployeeTimeTracking";
import EmployeeNotificationPage from "./pages/EmployeeNotificationPage";

//employee

import EmployeeDashboard from "./pages/EmployeeDashboard";

// client admin

import ClientAdminDetailsPage from "./pages/ClientAdminDetailsPage";
import ClientAdminProjectDetails from "./pages/ClientAdminProjectDetails";
import ClientAdminSubtaskShow from "./pages/ClientAdminSubtaskShow";
import ClientAdminProjectContent from "./pages/ClientAdminProjectContent";
import ClientAdminProjectMediaGallery from "./components/ClientAdminProjectMediaGallery";
import ClientAdminPreviewPage from "./pages/ClientAdminPreviewPage";

import LoginPage from "./pages/LoginPage";

import ClientAdminNotificationPage from "./pages/ClientAdminNotificationPage";

import ViewSubtask from "./pages/admin-panel/subtask/ViewSubtask";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout_client />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<ClientAdminProjectDetails />} />
          <Route
            path="ClientAdminDetailsPage"
            element={<ClientAdminDetailsPage />}
          />
          <Route
            path="ClientAdminProjectDetails"
            element={<ClientAdminProjectDetails />}
          />
          <Route
            path="ClientAdminSubtaskShow"
            element={<ClientAdminSubtaskShow />}
          />
          <Route
            path="ClientAdminProjectContent"
            element={<ClientAdminProjectContent />}
          />
          <Route
            path="ClientAdminProjectMediaGallery"
            element={<ClientAdminProjectMediaGallery />}
          />
          <Route
            path="ClientAdminNotificationPage"
            element={<ClientAdminNotificationPage />}
          />
          <Route
            path="ClientAdminPreviewPage"
            element={<ClientAdminPreviewPage />}
          />
        </Route>
        <Route path="/" element={<Plain_layout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </Router>
  );
}

export default App;
