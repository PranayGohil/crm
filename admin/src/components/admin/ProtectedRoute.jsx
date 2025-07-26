import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    console.log("Not Authorized");
    return <Navigate to="/login" replace />;
  } else {
    console.log("Authorized");
  }

  return children;
};

export default ProtectedRoute;
