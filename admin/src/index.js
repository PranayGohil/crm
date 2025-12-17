import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.css";

import { SocketProvider } from "./contexts/SocketContext";
import { AuthProvider } from "./contexts/AuthContext";
import NotificationPermissionBanner from "./NotificationPermissionBanner";

import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

const root = ReactDOM.createRoot(document.getElementById("root"));
const adminUser = JSON.parse(localStorage.getItem("adminUser"));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <SocketProvider adminId={adminUser?._id}>
        <NotificationPermissionBanner />
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </SocketProvider>
    </AuthProvider>
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
  </BrowserRouter>
);

reportWebVitals();
