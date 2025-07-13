import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Layout_client from "./layout/Layout_client";

import Plain_layout from "./layout/Plain_layout";

import SubtaskDashboardContainer from "./pages/SubtaskDashboardContainer";

import ProjectContent from "./pages/ProjectContent";
import ProjectMediaGallery from "./pages/ProjectMediaGallery";


// client admin

import ClientDetailsPage from "./pages/ClientDetailsPage";
import ClientAdminProjectDetails from "./pages/ClientAdminProjectDetails";

import LoginPage from "./pages/LoginPage";

import ClientAdminNotificationPage from "./pages/ClientAdminNotificationPage";

import ViewSubtask from "./pages/ViewSubtask";

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
            path="/profile"
            element={<ClientDetailsPage />}
          />
          <Route
            path="/dashboard"
            element={<ClientAdminProjectDetails />}
          />
          <Route
            path="/subtasks/:projectId"
            element={<SubtaskDashboardContainer />}
          />
          <Route
            path="/view-content/:projectId"
            element={<ProjectContent />}
          />
          <Route
            path="/gallery/:projectId"
            element={<ProjectMediaGallery />}
          />
          <Route
            path="ClientAdminNotificationPage"
            element={<ClientAdminNotificationPage />}
          />
          <Route
            path="/subtask/view/:subtaskId"
            element={<ViewSubtask />}
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
