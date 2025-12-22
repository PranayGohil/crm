import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const DashboardMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const toggleMenu = () => setCollapsed(!collapsed);

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    // Add your logout logic here
    localStorage.removeItem("token");
    navigate("/login");
  };

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
            {!collapsed && <span className="font-medium">Dashboard</span>}
          </Link>

          {/* Projects */}
          <Link
            to="/project/dashboard"
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all mx-2 ${
              isActive("/project")
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            {!collapsed && <span className="font-medium">Projects</span>}
          </Link>

          {/* Tasks */}
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
            {!collapsed && <span className="font-medium">Task Management</span>}
          </Link>

          {/* Reports */}
          <Link
            to="/time-tracking"
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all mx-2 ${
              isActive("/time-tracking")
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
            {!collapsed && (
              <span className="font-medium">Team Time Tracking</span>
            )}
          </Link>

          {/* Clients */}
          <Link
            to="/client/dashboard"
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all mx-2 ${
              isActive("/client")
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {!collapsed && <span className="font-medium">Clients</span>}
          </Link>

          {/* Employees */}
          <Link
            to="/employee/dashboard"
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all mx-2 ${
              isActive("/employee")
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
            {!collapsed && <span className="font-medium">Employees</span>}
          </Link>

          {/* Designation */}
          <Link
            to="/designation"
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all mx-2 ${
              isActive("/designation")
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {!collapsed && <span className="font-medium">Designation</span>}
          </Link>

          {/* Department */}
          <Link
            to="/department"
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all mx-2 ${
              isActive("/department")
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
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            {!collapsed && <span className="font-medium">Department</span>}
          </Link>

          {/* Archived Projects */}
          <Link
            to="/archived-projects"
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all mx-2 ${
              isActive("/archived-projects")
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
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
            {!collapsed && (
              <span className="font-medium">Archived Projects</span>
            )}
          </Link>

          {/* Notification Settings */}
          <Link
            to="/notification-settings"
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all mx-2 ${
              isActive("/notification-settings")
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
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
            {!collapsed && (
              <span className="font-medium">Notification Settings</span>
            )}
          </Link>
        </div>
      </div>

      {/* Footer Section */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 text-gray-600 hover:bg-gray-100 rounded-lg w-full transition-all"
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default DashboardMenu;
