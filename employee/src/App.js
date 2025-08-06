import { SocketProvider } from "./contexts/SocketContext";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Layout_employee from "./layout/Layout_employee";

import Plain_layout from "./layout/Plain_layout";

import EmployeeTimeTracking from "./pages/EmployeeTimeTracking";
import EmployeeNotificationPage from "./pages/EmployeeNotificationPage";

//employee

import EmployeeDashboard from "./pages/EmployeeDashboard";
import ViewSubtask from "./pages/ViewSubtask";
import ProjectDetails from "./pages/ProjectDetails";

import LoginPage from "./pages/LoginPage";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const employeeUser = JSON.parse(localStorage.getItem("employeeUser"));
  return (
    <SocketProvider employeeId={employeeUser?._id}>
      <Router>
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
            <Route path="/subtask/view/:subtaskId" element={<ViewSubtask />} />
            <Route
              path="/project/details/:projectId"
              element={<ProjectDetails />}
            />
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
    </SocketProvider>
  );
}

export default App;
