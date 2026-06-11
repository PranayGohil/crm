// components/admin/RequireMaulshree.jsx
// Route guard for the Maulshree (main CRM) area. Admins without Maulshree
// access (i.e. sales-only Mukhwas/Breeliq admins) are redirected to the sales
// panel so they only ever see their own section.
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { hasMaulshreeAccess, hasSalesAccess } from "../../constants";

const RequireMaulshree = () => {
  const { user } = useAuth();

  if (hasMaulshreeAccess(user)) {
    return <Outlet />;
  }

  // Sales-only admins land on the sales panel; anyone with neither falls back
  // to their profile page rather than being bounced to a forbidden dashboard.
  return <Navigate to={hasSalesAccess(user) ? "/sales-panel" : "/admin/profile"} replace />;
};

export default RequireMaulshree;
