import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import DashboardOverview from "./pages/DashboardOverview";
import LoginPage from "./pages/admin-panel/LoginPage";
import AllProject from "./pages/project/AllProject";
// ... import other admin pages

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="/dashboard" element={<DashboardOverview />} />

        {/* client */}
        <Route path="/client/dashboard" element={<ClientDashboardPage />} />
        <Route path="/client/create" element={<CreateNewClient />} />
        <Route path="/client/details/:id" element={<ClientDetailsPage />} />
        <Route path="/client/edit/:id" element={<EditClient />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}
