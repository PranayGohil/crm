import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.css";

import { SocketProvider } from "./contexts/SocketContext";
import { AuthProvider } from "./contexts/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
const adminUser = JSON.parse(localStorage.getItem("adminUser"));
root.render(
  <AuthProvider>
    <SocketProvider adminId={adminUser?._id}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </SocketProvider>
  </AuthProvider>
);

reportWebVitals();
