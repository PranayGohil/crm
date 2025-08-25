import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "react-bootstrap";

const DashboardMenu = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const toggleMenu = () => setCollapsed(!collapsed);

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div
      className={`flex flex-col relative justify-between bg-white border-r border-gray-200 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      } h-screen`}
    >
      {/* Collapse Button */}
      <div className="absolute -right-3 top-6 z-20 overflow-visible">
        <button
          onClick={toggleMenu}
          className="bg-white shadow-md p-2 w-7 h-10 rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          <div className="flex justify-center items-center">
            <svg
              className={`w-3 h-5 text-gray-600 transition-transform duration-300 ${
                collapsed ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </div>
        </button>
      </div>

      {/* Top Section */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
        <div className="p-2 bg-blue-100 rounded-lg">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        {!collapsed && (
          <span className="text-lg font-semibold text-gray-800">
            Dashboard Pro
          </span>
        )}
      </div>

      <div className="flex flex-col h-full overflow-y-auto py-4">
        <div className="px-2 flex flex-col gap-1">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all mx-2 ${
              isActive("/dashboard")
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            {!collapsed && <span>Dashboard</span>}
          </Link>

          <Link
            to="/subtasks"
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all mx-2 ${
              isActive("/subtasks")
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            {!collapsed && <span>Task Management</span>}
          </Link>

          {/* Reports */}
          <div>
            <Link
              to="/team-time-tracking"
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all mx-2 ${
                isActive("/team-time-tracking")
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              {!collapsed && <span>Team Time Tracking</span>}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMenu;
