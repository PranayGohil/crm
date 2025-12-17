import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "react-toastify/dist/ReactToastify.css";

import Layout_client from "./layout/Layout_client";

import Plain_layout from "./layout/Plain_layout";

import SubtaskDashboardContainer from "./pages/SubtaskDashboardContainer";

import ProjectContent from "./pages/ProjectDetails";
import ProjectMediaGallery from "./pages/ProjectMediaGallery";

// client admin

import ClientDetailsPage from "./pages/ClientDetailsPage";
import ClientDashboard from "./pages/ClientDashboard";

import LoginPage from "./pages/LoginPage";

import ClientAdminNotificationPage from "./pages/ClientAdminNotificationPage";

import ViewSubtask from "./pages/ViewSubtask";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout_client />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<ClientDashboard />} />
        <Route path="/profile" element={<ClientDetailsPage />} />
        <Route path="/dashboard" element={<ClientDashboard />} />
        <Route
          path="/subtasks/:projectId"
          element={<SubtaskDashboardContainer />}
        />
        <Route
          path="/project-details/:projectId"
          element={<ProjectContent />}
        />
        <Route
          path="/project/gallery/:projectId"
          element={<ProjectMediaGallery />}
        />
        <Route
          path="ClientAdminNotificationPage"
          element={<ClientAdminNotificationPage />}
        />
        <Route path="/subtask/view/:subtaskId" element={<ViewSubtask />} />
      </Route>
      <Route path="/" element={<Plain_layout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
    </Routes>
  );
}

export default App;
