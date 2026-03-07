import React, { useEffect, useState } from "react";
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
      .then((res) => setSummary(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    axios
      .get(`${process.env.REACT_APP_API_URL}/api/statistics/department-capacities`)
      .then((res) => setDepartmentCapacities(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!summary || loading) return <LoadingOverlay />;

  return (
    <div className="w-full">
      {/* ── Top 3 stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Projects */}
        <Link
          to="/project/dashboard"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Total Projects</h3>
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800">{summary.totalProjects}</span>
            <span className="text-sm text-gray-500">Projects</span>
          </div>
        </Link>

        {/* Total Clients */}
        <Link
          to="/client/dashboard"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Total Clients</h3>
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800">{summary.totalClients}</span>
            <span className="text-sm text-gray-500">Clients</span>
          </div>
        </Link>

        {/* Subtasks */}
        <Link
          to="/subtasks"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Subtasks</h3>
            <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-gray-800">{summary.totalTasks}</span>
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {summary.tasksByStage &&
              Object.entries(summary.tasksByStage).map(([stage, count]) => (
                <span
                  key={stage}
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${stage === "CAD Design" ? "bg-blue-100 text-blue-800"
                      : stage === "SET Design" ? "bg-green-100 text-green-800"
                        : stage === "Render" ? "bg-purple-100 text-purple-800"
                          : stage === "QC" ? "bg-cyan-100 text-cyan-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                >
                  {count} {stage}
                </span>
              ))}
          </div>
        </Link>
      </div>

      {/* ── Department Capacity Card ── */}
      <div className="bg-white rounded-xl mt-3 shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Department Capacity</h3>
          <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        {/* Mode toggle buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          {/* Primary mode */}
          <div className="flex gap-2">
            <button
              className={`flex-1 sm:flex-none px-3 py-2 text-xs font-medium rounded-lg transition-colors ${capacityMode === "time" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              onClick={() => { setCapacityMode("time"); setViewOption("withoutSundays"); }}
            >
              Time to Complete
            </button>
            <button
              className={`flex-1 sm:flex-none px-3 py-2 text-xs font-medium rounded-lg transition-colors ${capacityMode === "employee" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              onClick={() => { setCapacityMode("employee"); setViewOption("daily"); }}
            >
              Employee Capacity
            </button>
          </div>

          {/* Secondary view options */}
          <div className="flex flex-wrap gap-2">
            {capacityMode === "time" ? (
              <>
                <button
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${viewOption === "withSundays" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  onClick={() => setViewOption("withSundays")}
                >
                  With Sundays
                </button>
                <button
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${viewOption === "withoutSundays" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  onClick={() => setViewOption("withoutSundays")}
                >
                  Without Sundays
                </button>
              </>
            ) : (
              <>
                {[
                  { key: "daily", label: "Daily" },
                  { key: "monthlyWithSundays", label: "Monthly (Incl.)" },
                  { key: "monthlyWithoutSundays", label: "Monthly (Excl.)" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${viewOption === opt.key ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    onClick={() => setViewOption(opt.key)}
                  >
                    {opt.label}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Department grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {departmentCapacities &&
            Object.entries(departmentCapacities.departmentCapacities).map(([dept, data]) => {
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
                const days = viewOption === "withSundays"
                  ? data.estimatedDaysToComplete
                  : data.estimatedDaysToCompleteWithoutSundays;
                value = days;
                label = days
                  ? `~${days} ${viewOption === "withSundays" ? "calendar" : "working"} days to complete`
                  : "Insufficient capacity or No tasks";
              }

              const isInsufficient = label === "Insufficient capacity or No tasks";

              return (
                <div key={dept} className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h5 className="font-semibold text-gray-800 capitalize mb-1 text-sm">{dept}</h5>
                  <div className="text-xs text-gray-600">
                    {isInsufficient ? (
                      <span className="text-red-500">{label}</span>
                    ) : (
                      <span>{label}: <strong className="text-gray-800">{value ?? "N/A"}</strong></span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default DashboardSummaryCards;