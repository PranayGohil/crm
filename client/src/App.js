import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Layout from "./layout/Layout";
import Layout_employee from "./layout/Layout_employee";
import Layout_client from "./layout/Layout_client";

import Plain_layout from "./layout/Plain_layout";

import DashboardOverview from "./pages/DashboardOverview";

import ClientDashboardPage from "./pages/client/ClientDashboardPage";
import CreateNewClient from "./pages/client/CreateNewClient";
import ClientDetailsPage from "./pages/client/ClientDetailsPage";
import ClientProjectDetails from "./pages/ClientProjectDetails";
import ClientSubtaskShow from "./pages/ClientSubtaskShow";

import ProjectDetails from "./pages/ProjectDetails";

import AllProject from "./pages/project/AllProject";
import AddNewProject from "./pages/project/AddNewProject";
import SubtaskManagement from "./pages/SubtaskManagement";
import AddSubtask from "./pages/subtask/AddSubtask";
import SubtaskDashboardContainer from "./pages/subtask/SubtaskDashboardContainer";

import ProjectContent from "./pages/project/ProjectContent";
import EditProjectContent from "./pages/EditProjectContent";
import ProjectMediaGallery from "./components/ProjectMediaGallery";

import TeamMemberDashboard from "./pages/TeamMemberDashboard";
import EmployeeProfileEdit from "./pages/EmployeeProfileEdit";
import TeamMemberProfile from "./pages/TeamMemberProfile";
import TaskTimeboard from "./pages/TaskTimeboard";
import NotificationAdmin from "./pages/NotificationAdmin";

import EditClient from "./pages/client/EditClient";
import EditProject from "./pages/EditProject";
import CreateProjectContent from "./pages/project/CreateProjectContent";
import EditSubtask from "./pages/subtask/EditSubtask";
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

import ViewSubtask from "./pages/subtask/ViewSubtask";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="/dashboard" element={<DashboardOverview />} />

          {/* client */}
          <Route path="/client/dashboard" element={<ClientDashboardPage />} />
          <Route path="/client/create" element={<CreateNewClient />} />
          <Route path="/client/details/:id" element={<ClientDetailsPage />} />
          <Route path="/client/edit/:id" element={<EditClient />} />

          <Route
            path="clientprojectdetails"
            element={<ClientProjectDetails />}
          />
          <Route path="clientsubtaskshow" element={<ClientSubtaskShow />} />
          <Route path="/project/details/:projectId" element={<ProjectDetails />} />
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
          <Route path="/project/view-content/:projectId" element={<ProjectContent />} />
          <Route path="editprojectcontent" element={<EditProjectContent />} />
          <Route path="/project/gallery/:projectId" element={<ProjectMediaGallery />} />
          <Route path="teammemberdashboard" element={<TeamMemberDashboard />} />
          <Route path="employeeprofileedit" element={<EmployeeProfileEdit />} />
          <Route path="teammemberprofile" element={<TeamMemberProfile />} />
          <Route path="tasktimeboard" element={<TaskTimeboard />} />
          <Route
            path="timetrackingdashboard"
            element={<TimeTrackingDashboard />}
          />
          <Route path="notificationadmin" element={<NotificationAdmin />} />

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
            path="CreateEmployeeProfile"
            element={<CreateEmployeeProfile />}
          />
        </Route>

        <Route path="/" element={<Layout_employee />}>
          <Route path="employeedashboard" element={<EmployeeDashboard />} />
          <Route
            path="employeetimetracking"
            element={<EmployeeTimeTracking />}
          />
          <Route
            path="employeenotificationpage"
            element={<EmployeeNotificationPage />}
          />
        </Route>

        <Route path="/" element={<Plain_layout />}>
          <Route path="login" element={<LoginPage />} />
        </Route>

        <Route path="/" element={<Layout_client />}>
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
