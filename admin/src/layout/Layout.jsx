import React from "react";
import DashboardMenu from "../components/admin/DashboardMenu";
import HeaderAdmin from "../components/admin/HeaderAdmin";
import Footer from "../components/admin/Footer";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="bg-white shadow-md">
        <DashboardMenu />
      </aside>

      {/* Main Section */}
      <div className="w-100 flex flex-col overflow-auto">
        {/* Header */}
        <header className="shadow bg-white sticky top-0 z-10">
          <HeaderAdmin />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white shadow-inner border">
          <Footer />
        </footer>
      </div>
    </div>
  );
};

export default Layout;
