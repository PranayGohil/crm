import React, { useState } from "react";
import DashboardMenu from "../components/admin/DashboardMenu";
import HeaderAdmin from "../components/admin/HeaderAdmin";
import Footer from "../components/admin/Footer";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative z-40 lg:z-auto
          h-full bg-white shadow-md
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <DashboardMenu onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Main Section */}
      <div className="flex flex-col flex-1 min-w-0 overflow-auto">
        {/* Header */}
        <header className="shadow bg-white sticky top-0 z-10">
          <HeaderAdmin onMenuToggle={() => setMobileOpen(true)} />
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