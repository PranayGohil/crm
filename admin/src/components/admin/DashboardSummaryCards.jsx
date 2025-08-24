import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import LoadingOverlay from "./LoadingOverlay";
import { Link } from "react-router-dom";

const DashboardSummaryCards = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [departmentCapacities, setDepartmentCapacities] = useState(null);
  const [capacityMode, setCapacityMode] = useState("time");
  const [viewOption, setViewOption] = useState("withoutSundays");

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/statistics/summary`)
      .then((res) => {
        setSummary(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    axios
      .get(
        `${process.env.REACT_APP_API_URL}/api/statistics/department-capacities`
      )
      .then((res) => {
        setDepartmentCapacities(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (!summary || loading) return <LoadingOverlay />;

  return (
    <div className="p-3 my-3">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Projects Card */}
        <Link
          to="/project/dashboard"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Total Projects
            </h3>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-end">
            <span className="text-3xl font-bold text-gray-800">
              {summary.totalProjects}
            </span>
            <span className="ml-2 text-gray-600">Projects</span>
          </div>
        </Link>

        {/* Total Clients Card */}
        <Link
          to="/client/dashboard"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Total Clients
            </h3>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600"
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
            </div>
          </div>
          <div className="flex items-end">
            <span className="text-3xl font-bold text-gray-800">
              {summary.totalClients}
            </span>
            <span className="ml-2 text-gray-600">Clients</span>
          </div>
        </Link>

        {/* Subtasks Card */}
        <Link
          to="/subtasks"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Subtasks</h3>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-purple-600"
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
            </div>
          </div>
          <div className="flex items-end mb-4">
            <span className="text-3xl font-bold text-gray-800">
              {summary.totalTasks}
            </span>
            <span className="ml-2 text-gray-600">Total</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {summary.tasksByStage &&
              Object.entries(summary.tasksByStage).map(([stage, count]) => (
                <span
                  key={stage}
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    stage === "CAD Design"
                      ? "bg-blue-100 text-blue-800"
                      : stage === "SET Design"
                      ? "bg-green-100 text-green-800"
                      : stage === "Render"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {count} {stage}
                </span>
              ))}
          </div>
        </Link>
      </div>
      {/* Department Capacity Card */}
      <div className="bg-white rounded-lg mt-4 shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Department Capacity
          </h3>
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-orange-600"
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
        </div>

        <div className="flex flex-wrap justify-between gap-2 mb-4">
          <div className="flex gap-2">
            <div>
              <button
                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                  capacityMode === "time"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
                onClick={() => {
                  setCapacityMode("time");
                  setViewOption("withoutSundays");
                }}
              >
                Time to Complete Tasks
              </button>
            </div>
            <div>
              <button
                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                  capacityMode === "employee"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
                onClick={() => {
                  setCapacityMode("employee");
                  setViewOption("daily");
                }}
              >
                Employee Capacity
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {capacityMode === "time" ? (
              <>
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    viewOption === "withSundays"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                  onClick={() => setViewOption("withSundays")}
                >
                  With Sundays
                </button>
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    viewOption === "withoutSundays"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                  onClick={() => setViewOption("withoutSundays")}
                >
                  Without Sundays
                </button>
              </>
            ) : (
              <>
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    viewOption === "daily"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                  onClick={() => setViewOption("daily")}
                >
                  Daily
                </button>
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    viewOption === "monthlyWithSundays"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                  onClick={() => setViewOption("monthlyWithSundays")}
                >
                  Monthly (With Sundays)
                </button>
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    viewOption === "monthlyWithoutSundays"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                  onClick={() => setViewOption("monthlyWithoutSundays")}
                >
                  Monthly (Without Sundays)
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {departmentCapacities &&
            Object.entries(departmentCapacities.departmentCapacities).map(
              ([dept, data]) => {
                let value = null;
                let label = "";

                if (capacityMode === "employee") {
                  if (viewOption === "daily") {
                    value = data.totalDailyCapacity;
                    label = "Units / day";
                  } else if (viewOption === "monthlyWithSundays") {
                    value = data.totalRemainingMonthlyCapacityWithSundays;
                    label = "Units this month (incl. Sundays)";
                  } else {
                    value = data.totalRemainingMonthlyCapacityWithoutSundays;
                    label = "Units this month (excl. Sundays)";
                  }
                } else {
                  const days =
                    viewOption === "withSundays"
                      ? data.estimatedDaysToComplete
                      : data.estimatedDaysToCompleteWithoutSundays;

                  value = days;
                  label = days
                    ? `~${days} ${
                        viewOption === "withSundays" ? "calendar" : "working"
                      } days to complete tasks`
                    : "Insufficient capacity";
                }

                return (
                  <div
                    key={dept}
                    className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <h5 className="font-semibold text-gray-800 capitalize mb-2">
                      {dept}
                    </h5>
                    <div className="text-sm text-gray-600">
                      {label === "Insufficient capacity" ? (
                        <span className="text-red-500">{label}</span>
                      ) : (
                        <>
                          {label}:{" "}
                          <strong className="text-gray-800">
                            {value !== null ? value : "N/A"}
                          </strong>
                        </>
                      )}
                    </div>
                  </div>
                );
              }
            )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSummaryCards;
