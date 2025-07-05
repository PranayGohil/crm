import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Layout_employee from "./layout/Layout_employee";
import Layout_client from "./layout/Layout_client";


import Plain_layout from "./layout/Plain_layout";

import DashboardOverview from "./pages/DashboardOverview";

import ClientDashboardPage from "./pages/ClientDashboardPage";
import CreateNewClient from "./pages/CreateNewClient";
import ClientDetailsPage from "./pages/ClientDetailsPage";
import ClientProjectDetails from "./pages/ClientProjectDetails";
import ClientSubtaskShow from "./pages/ClientSubtaskShow";

import PreviewButton from "./pages/PreviewButton";

import AllProject from "./pages/AllProject";
import AddNewProject from "./pages/AddNewProject";
import SubtaskManagement from "./pages/SubtaskManagement";
import SubtaskManagementBulk from "./pages/SubtaskManagementBulk";
import SubtaskDashboardContainer from "./pages/SubtaskDashboardContainer";

import ProjectContent from "./pages/ProjectContent";
import EditProjectContent from "./pages/EditProjectContent";
import ProjectMediaGallery from "./components/ProjectMediaGallery";

import TeamMemberDashboard from "./pages/TeamMemberDashboard";
import EmployeeProfileEdit from "./pages/EmployeeProfileEdit";
import TeamMemberProfile from "./pages/TeamMemberProfile";
import TaskTimeboard from "./pages/TaskTimeboard";
import NotificationAdmin from "./pages/NotificationAdmin";

import EditClient from "./pages/EditClient";
import EditProject from "./pages/EditProject";
import CreateProjectContent from "./pages/CreateProjectContent";
import EditSubtaskManagement from "./pages/EditSubtaskManagement";
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="client-dashboard" element={<ClientDashboardPage />} />
          <Route path="createnewclient" element={<CreateNewClient />} />
          <Route path="clientdetailspage/:id" element={<ClientDetailsPage />} />
          <Route path="clientprojectdetails" element={<ClientProjectDetails />} />
          <Route path="clientsubtaskshow" element={<ClientSubtaskShow />} />
          <Route path="previewbutton" element={<PreviewButton />} />
          <Route path="allproject" element={<AllProject />} />
          <Route path="addnewproject" element={<AddNewProject />} />
          <Route path="subtaskmanagement" element={<SubtaskManagement />} />
          <Route path="subtaskmanagementbulk/:projectId" element={<SubtaskManagementBulk />} />
          <Route path="subtaskdashboardcontainer/:projectId" element={<SubtaskDashboardContainer />} />
          <Route path="projectcontent" element={<ProjectContent />} />
          <Route path="editprojectcontent" element={<EditProjectContent />} />
          <Route path="projectmediagallery" element={<ProjectMediaGallery />} />
          <Route path="teammemberdashboard" element={<TeamMemberDashboard />} />
          <Route path="employeeprofileedit" element={<EmployeeProfileEdit />} />
          <Route path="teammemberprofile" element={<TeamMemberProfile />} />
          <Route path="tasktimeboard" element={<TaskTimeboard />} />
          <Route path="timetrackingdashboard" element={<TimeTrackingDashboard />} />
          <Route path="notificationadmin" element={<NotificationAdmin />} />

          {/* edit page */}
          <Route path="EditClient/:id" element={<EditClient />} />
          <Route path="EditProject" element={<EditProject />} />
          <Route path="CreateProjectContent" element={<CreateProjectContent />} />
          <Route path="EditSubtaskManagement" element={<EditSubtaskManagement />} />
          <Route path="CreateEmployeeProfile" element={<CreateEmployeeProfile />} />

        </Route>

        <Route path="/" element={<Layout_employee />}>
          <Route path="employeedashboard" element={<EmployeeDashboard />} />
          <Route path="employeetimetracking" element={<EmployeeTimeTracking />} />
          <Route path="employeenotificationpage" element={<EmployeeNotificationPage />} />
        </Route>

        <Route path="/" element={<Plain_layout />}>
          <Route path="login" element={<LoginPage />} />
        </Route>

        <Route path="/" element={<Layout_client />}>
          <Route path="ClientAdminDetailsPage" element={<ClientAdminDetailsPage />} />
          <Route path="ClientAdminProjectDetails" element={<ClientAdminProjectDetails />} />
          <Route path="ClientAdminSubtaskShow" element={<ClientAdminSubtaskShow />} />
          <Route path="ClientAdminProjectContent" element={<ClientAdminProjectContent />} />
          <Route path="ClientAdminProjectMediaGallery" element={<ClientAdminProjectMediaGallery />} />
          <Route path="ClientAdminNotificationPage" element={<ClientAdminNotificationPage />} />
          <Route path="ClientAdminPreviewPage" element={<ClientAdminPreviewPage />} />
        </Route>

      </Routes>
    </Router>

  );
}

export default App;

