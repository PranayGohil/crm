import React, { useState } from "react";
import HeaderEmployee from "../components/HeaderEmployee";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import DashboardMenu from "../components/DashboardMenu";

const Layout_employee = () => {
  const user = JSON.parse(localStorage.getItem("employeeUser"));
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sidebar (managers only) ── */}
      {user?.is_manager === true && (
        <>
          {/* Mobile overlay */}
          {mobileOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
          )}

          {/* Sidebar drawer */}
          <aside
            className={`fixed inset-y-0 left-0 z-40 bg-white shadow-md transition-transform duration-300
              lg:relative lg:translate-x-0 lg:z-auto lg:flex-shrink-0
              ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            <DashboardMenu onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      {/* ── Main column ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-auto">
        {/* Header */}
        <header className="shadow bg-white sticky top-0 z-10">
          <HeaderEmployee
            onMenuToggle={() => setMobileOpen((o) => !o)}
            showMenuButton={user?.is_manager === true}
          />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white shadow-inner">
          <Footer />
        </footer>
      </div>
    </div>
  );
};

export default Layout_employee;