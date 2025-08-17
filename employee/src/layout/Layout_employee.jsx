import React, { useEffect } from "react";
import HeaderEmployee from "../components/HeaderEmployee";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import DashboardMenu from "../components/DashboardMenu";

const Layout_employee = () => {
  const user = JSON.parse(localStorage.getItem("employeeUser"));
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      {user.is_manager === true && (
        <aside className="bg-white shadow-md">
          <DashboardMenu />
        </aside>
      )}
      {/* Main Section */}
      <div className="w-100 flex flex-col overflow-auto">
        {/* Header */}
        <header className="shadow bg-white sticky top-0 z-10">
          <HeaderEmployee />
        </header>

        {/* Dynamic Page Content */}
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
