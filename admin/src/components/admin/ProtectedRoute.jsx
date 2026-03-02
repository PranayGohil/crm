// components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoadingOverlay from "./LoadingOverlay";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading indicator while checking authentication
  if (loading) {
    return <LoadingOverlay />; // Or any loading spinner
  }

  // Only redirect after loading is complete and user is not authenticated
  if (!isAuthenticated) {
    console.log("Not Authorized - Redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("Authorized - Access granted");
  return children;
};

export default ProtectedRoute; 