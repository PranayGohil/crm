import React from "react";
import HeaderClient from "../components/HeaderClient";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom"; // For React Router v6+

const Layout_client = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Section */}
      <div className="w-100 flex flex-col overflow-auto">
        {/* Header */}
        <header className="shadow bg-white sticky top-0 z-10">
          <HeaderClient />
        </header>

        {/* Dynamic Page Content */}
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

export default Layout_client;
