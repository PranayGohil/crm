import React from "react";
import DashboardMenu from "../components/DashboardMenu";
import HeaderAdmin from "../components/HeaderAdmin";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom"; // For React Router v6+


const Layout = () => {
  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <DashboardMenu />
      </aside>

      {/* Main Section */}
      <div className="main-section">
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
