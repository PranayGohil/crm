import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Layout from "./layout/Layout";

import Plain_layout from "./layout/Plain_layout";

import DashboardOverview from "./pages/admin-panel/DashboardOverview";

import ClientDashboardPage from "./pages/admin-panel/client/ClientDashboardPage";
import CreateNewClient from "./pages/admin-panel/client/CreateNewClient";
import ClientDetailsPage from "./pages/admin-panel/client/ClientDetailsPage";
import ClientProjectDetails from "./pages/admin-panel/client/ClientProjectDetails";
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

import EmployeeDashboard from "./pages/admin-panel/employee/EmployeeDashboard";
import EmployeeProfileEdit from "./pages/admin-panel/employee/EmployeeProfileEdit";
import TeamMemberProfile from "./pages/admin-panel/employee/TeamMemberProfile";
import TaskTimeboard from "./pages/TaskTimeboard";
import NotificationAdmin from "./pages/admin-panel/NotificationAdmin";

import EditClient from "./pages/admin-panel/client/EditClient";
import EditProject from "./pages/EditProject";
import CreateProjectContent from "./pages/admin-panel/project/CreateProjectContent";
import EditSubtask from "./pages/admin-panel/subtask/EditSubtask";
import CreateEmployeeProfile from "./pages/admin-panel/employee/CreateEmployeeProfile";

import TimeTrackingDashboard from "./pages/TimeTrackingDashboard";

import LoginPage from "./pages/LoginPage";

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
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Protected routes */}
          <Route path="/" element={<DashboardOverview />} />
          <Route index element={<DashboardOverview />} />
          <Route path="/dashboard" element={<DashboardOverview />} />

          {/* client */}
          <Route path="/client/dashboard" element={<ClientDashboardPage />} />
          <Route path="/client/create" element={<CreateNewClient />} />
          <Route path="/client/details/:id" element={<ClientDetailsPage />} />
          <Route path="/client/edit/:id" element={<EditClient />} />

          <Route
            path="/client/projects/:username"
            element={<ClientProjectDetails />}
          />

          <Route path="clientsubtaskshow" element={<ClientSubtaskShow />} />
          <Route
            path="/project/details/:projectId"
            element={<ProjectDetails />}
          />
          <Route path="/project/dashboard" element={<AllProject />} />
          <Route path="/project/add" element={<AddNewProject />} />
          <Route path="subtaskmanagement" element={<SubtaskManagement />} />
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
            path="/project/view-content/:projectId"
            element={<ProjectContent />}
          />
          <Route path="editprojectcontent" element={<EditProjectContent />} />
          <Route
            path="/project/gallery/:projectId"
            element={<ProjectMediaGallery />}
          />
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/edit/:employeeId" element={<EmployeeProfileEdit />} />
          <Route path="/employee/profile/:id" element={<TeamMemberProfile />} />
          <Route path="tasktimeboard" element={<TaskTimeboard />} />
          <Route
            path="timetrackingdashboard"
            element={<TimeTrackingDashboard />}
          />
          <Route path="/notifications" element={<NotificationAdmin />} />

          {/* edit page */}

          <Route path="/project/edit/:projectId" element={<EditProject />} />
          <Route
            path="/project/edit-content/:projectId"
            element={<CreateProjectContent />}
          />
          <Route
            path="/project/subtask/edit/:subtaskId"
            element={<EditSubtask />}
          />
          <Route
            path="/employee/create-profile"
            element={<CreateEmployeeProfile />}
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
