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
      className={`flex flex-col relative justify-between bg-[#0a3749] text-white transition-all duration-500 ${
        collapsed ? "w-20" : "w-64"
      } h-screen`}
    >
      {/* Collapse Button */}
      <div className="absolute -right-3 top-6 z-20 overflow-visible">
        <Button
          onClick={toggleMenu}
          className="bg-white shadow p-2 w-7 h-10"
          style={{ borderRadius: "15px" }}
        >
          <div className="flex justify-center items-center">
            <img
              src="/SVG/right-arrow.svg"
              alt="toggle"
              className={`w-3 h-5 transition-transform duration-500 ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </div>
        </Button>
      </div>

      {/* Top Section */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[#0c4559]">
        <div className="p-2 bg-white rounded-md">
          <img
            src="/SVG/dashboard-main.svg"
            alt="dashboard-main"
            className="w-5 h-5"
          />
        </div>
        {!collapsed && (
          <span className="text-lg font-medium">Dashboard Pro</span>
        )}
      </div>
      <div className="flex flex-col h-full overflow-scroll">
        <div className="px-2 py-4 flex flex-col gap-6">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-3 py-2 text-white rounded-md transition ${
              isActive("/dashboard") ? "bg-[#0c4559]" : "hover:bg-[#0c4559]"
            }`}
          >
            <img src="/SVG/home-dashboard.svg" alt="home" className="w-5 h-5" />
            {!collapsed && <span>Dashboard</span>}
          </Link>

          {/* Tasks */}
          <div>
            {/* {!collapsed && (
              <p className="text-xs uppercase text-gray-300 mb-2">Tasks</p>
            )} */}
            <Link
              to="/subtasks"
              className={`flex items-center gap-3 px-3 py-2 text-white rounded-md transition ${
                isActive("/subtasks") ? "bg-[#0c4559]" : "hover:bg-[#0c4559]"
              }`}
            >
              <img
                src="/SVG/task-managment.svg"
                alt="task"
                className="w-5 h-5"
              />
              {!collapsed && <span>Task Management</span>}
            </Link>
          </div>

          {/* Reports */}
          <div>
            {/* {!collapsed && (
              <p className="text-xs uppercase text-gray-300 mb-2">Reports</p>
            )} */}
            <Link
              to="/team-time-tracking"
              className={`flex items-center gap-3 px-3 py-2 text-white rounded-md transition ${
                isActive("/team-time-tracking")
                  ? "bg-[#0c4559]"
                  : "hover:bg-[#0c4559]"
              }`}
            >
              <img src="/SVG/reports.svg" alt="reports" className="w-5 h-5" />
              {!collapsed && <span>Team Time Tracking</span>}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMenu;
