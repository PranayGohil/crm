import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    to: "/subtasks",
    label: "Task Management",
    d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  },
  {
    to: "/team-time-tracking",
    label: "Team Time Tracking",
    d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
];

const DashboardMenu = ({ onClose }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div
      className={`flex flex-col relative bg-white border-r border-gray-200 transition-all duration-300 h-screen
        ${collapsed ? "w-20" : "w-64"}`}
    >
      {/* Mobile ✕ close button — only visible on small screens */}
      <button
        onClick={onClose}
        aria-label="Close menu"
        className="absolute top-4 right-4 z-20 lg:hidden flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Desktop collapse toggle — only visible on large screens */}
      <div className="absolute -right-3 top-6 z-20 hidden lg:block overflow-visible">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="bg-white shadow-md p-2 w-7 h-10 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
        >
          <svg
            className={`w-3 h-5 text-gray-600 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        {!collapsed && <span className="text-lg font-semibold text-gray-800 truncate">Dashboard Pro</span>}
      </div>

      {/* Nav */}
      <div className="flex flex-col flex-1 overflow-y-auto py-4">
        <nav className="px-2 flex flex-col gap-1">
          {navItems.map(({ to, label, d }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}   /* closes drawer on mobile after navigation */
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all mx-2 ${isActive(to) ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
              </svg>
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default DashboardMenu;