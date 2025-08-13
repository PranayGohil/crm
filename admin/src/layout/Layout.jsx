import React from "react";
import DashboardMenu from "../components/admin/DashboardMenu";
import HeaderAdmin from "../components/admin/HeaderAdmin";
import Footer from "../components/admin/Footer";
import { Outlet } from "react-router-dom"; // For React Router v6+

const Layout = () => {
  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar" style={{ height: "100vh", overflowY: "auto" }}>
        <div>
          <DashboardMenu />
        </div>
      </aside>

      {/* Main Section */}
      <div
        className="main-section"
        style={{ height: "100vh", overflowY: "auto" }}
      >
        {/* Header */}
        <header>
          <HeaderAdmin />
        </header>

        {/* Dynamic Page Content */}
        <main className="content">
          <Outlet />
        </main>

        {/* Footer */}
        <footer>
          <Footer />
        </footer>
      </div>
    </div>
  );
};

export default Layout;
