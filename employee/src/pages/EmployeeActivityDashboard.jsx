// EmployeeActivityDashboard.optimized.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import LoadingOverlay from "../components/LoadingOverlay";
import {
  useDebounce,
  RANGE_OPTIONS,
  PaginationBar,
  CustomDateModal,
} from "../hooks/useEmployeeData";

const API = process.env.REACT_APP_API_URL;

const ACTIVITY_TYPES = [
  { key: "all", label: "All Activities" },
  { key: "task_started", label: "Tasks Started" },
  { key: "task_paused", label: "Tasks Paused" },
  { key: "stage_completed", label: "Stages Completed" },
  { key: "task_assigned", label: "Tasks Assigned" },
];

const ACTIVITY_CONFIG = {
  task_started: { icon: "▶️", color: "#10b981", bgColor: "#d1fae5", label: "Started Task" },
  task_paused: { icon: "⏸️", color: "#f59e0b", bgColor: "#fef3c7", label: "Paused Task" },
  status_changed: { icon: "🔄", color: "#3b82f6", bgColor: "#dbeafe", label: "Status Changed" },
  stage_completed: { icon: "✅", color: "#8b5cf6", bgColor: "#ede9fe", label: "Stage Completed" },
  task_assigned: { icon: "📌", color: "#ec4899", bgColor: "#fce7f3", label: "Task Assigned" },
};

const getConfig = (type) =>
  ACTIVITY_CONFIG[type] ?? { icon: "📝", color: "#6b7280", bgColor: "#f3f4f6", label: type };

const EmployeeActivityDashboard = () => {
  const navigate = useNavigate();
  const employeeId = JSON.parse(localStorage.getItem("employeeUser") ?? "{}")?._id;

  // data
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ totalActivities: 0, tasksStarted: 0, tasksPaused: 0, tasksCompleted: 0, totalTimeSpent: 0 });
  const [uniqueProjects, setUniqueProjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });

  // filters
  const [selectedRange, setSelectedRange] = useState("week");
  const [customDates, setCustomDates] = useState({ from: "", to: "" });
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [activityType, setActivityType] = useState("all");
  const [projectSearch, setProjectSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const debouncedProjectSearch = useDebounce(projectSearch);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (page = 1, limit = pagination.limit) => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit,
        range: selectedRange,
        type: activityType,
        ...(debouncedProjectSearch && { project: debouncedProjectSearch }),
        ...(selectedRange === "custom" && customDates.from && { from: customDates.from }),
        ...(selectedRange === "custom" && customDates.to && { to: customDates.to }),
      });
      const { data } = await axios.get(`${API}/api/employee/activity-history/${employeeId}?${params}`);
      setActivities(data.activities);
      setStats(data.stats);
      setUniqueProjects(data.uniqueProjects ?? []);
      setPagination({ ...data.pagination, limit });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, selectedRange, customDates, activityType, debouncedProjectSearch]);

  useEffect(() => { fetchData(1, pagination.limit); }, [selectedRange, customDates, activityType, debouncedProjectSearch]);

  // ── Group by date for timeline ────────────────────────────────────────────
  const groupedByDate = activities.reduce((acc, a) => {
    const key = moment(a.timestamp).format("YYYY-MM-DD");
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => moment(b).diff(moment(a)));

  const totalTimeFmt = (() => {
    const dur = moment.duration(stats.totalTimeSpent, "seconds");
    return `${Math.floor(dur.asDays())}d ${dur.hours()}h ${dur.minutes()}m`;
  })();

  if (loading && !activities.length) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Activity Dashboard</h1>
            <p className="text-gray-600">Complete history of all your task activities</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {/* Time range */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Period:</label>
          <div className="flex flex-wrap gap-2">
            {RANGE_OPTIONS.map(({ key, label }) => (
              <button key={key}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedRange === key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
                onClick={() => key === "custom" ? setShowCustomModal(true) : setSelectedRange(key)}>
                {label}
                {key === "custom" && selectedRange === "custom" && customDates.from && (
                  <span className="ml-1 text-xs opacity-75">({customDates.from}→{customDates.to || "…"})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Type + project filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type:</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={activityType} onChange={(e) => setActivityType(e.target.value)}>
              {ACTIVITY_TYPES.map(({ key, label }) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Project:</label>
            <input type="text" placeholder="Type project name…" value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {[
            { label: "Total Activities", value: stats.totalActivities, color: "text-gray-800" },
            { label: "Tasks Started", value: stats.tasksStarted, color: "text-green-600" },
            { label: "Tasks Paused", value: stats.tasksPaused, color: "text-yellow-600" },
            { label: "Stages Completed", value: stats.tasksCompleted, color: "text-purple-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-gray-600 mt-1">{label}</div>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-500 mt-3">
          Showing {activities.length} of {pagination.total} activities
          {loading && <span className="ml-2 text-blue-500">↻ Updating…</span>}
        </p>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Activity Timeline</h2>

        {sortedDates.length === 0 && !loading ? (
          <div className="text-center py-10 text-gray-400">No activities found for the selected period.</div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((dateKey) => {
              const dayActivities = groupedByDate[dateKey];
              const isToday = moment(dateKey).isSame(moment(), "day");
              const isYesterday = moment(dateKey).isSame(moment().subtract(1, "day"), "day");
              let dateLabel = moment(dateKey).format("dddd, MMMM DD, YYYY");
              if (isToday) dateLabel = "Today — " + dateLabel;
              if (isYesterday) dateLabel = "Yesterday — " + dateLabel;

              return (
                <div key={dateKey}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">{moment(dateKey).format("DD")}</span>
                    </div>
                    <div>
                      <h3 className="text-md font-semibold text-gray-800">{dateLabel}</h3>
                      <p className="text-sm text-gray-500">{dayActivities.length} activities</p>
                    </div>
                  </div>

                  <div className="ml-6 pl-6 border-l-2 border-gray-200 space-y-3">
                    {dayActivities.map((activity, idx) => {
                      const config = getConfig(activity.type);
                      return (
                        <div key={idx} className="relative bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                          <div className="absolute -left-[27px] top-6 w-3 h-3 rounded-full border-2 border-white"
                            style={{ backgroundColor: config.color }} />
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                                style={{ backgroundColor: config.bgColor }}>
                                {config.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold" style={{ color: config.color }}>{config.label}</span>
                                  <span className="text-xs text-gray-500">{moment(activity.timestamp).format("hh:mm A")}</span>
                                </div>
                                <div className="text-sm text-gray-800 font-medium mb-1">{activity.task_name}</div>
                                <div className="text-xs text-gray-600">
                                  Project: <span className="font-medium">{activity.project_name}</span>
                                </div>
                                {activity.stage_name && (
                                  <span className="inline-block mt-2 text-xs px-2 py-1 rounded"
                                    style={{ backgroundColor: config.bgColor, color: config.color }}>
                                    {activity.stage_name}
                                  </span>
                                )}
                                {activity.details && (
                                  <div className="mt-2 text-xs text-gray-600 bg-white rounded px-3 py-2">{activity.details}</div>
                                )}
                                {activity.duration_seconds > 0 && (
                                  <div className="mt-2 text-xs text-gray-600">
                                    ⏱️ Duration: <span className="font-medium">{activity.duration}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {activity.task_id && (
                              <Link to={`/subtask/view/${activity.task_id}`} className="flex-shrink-0 text-blue-600 hover:text-blue-700">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <PaginationBar
          pagination={pagination}
          onPageChange={(p) => fetchData(p, pagination.limit)}
          onLimitChange={(l) => fetchData(1, l)}
          loading={loading}
        />
      </div>

      <CustomDateModal
        show={showCustomModal}
        onHide={() => setShowCustomModal(false)}
        dates={customDates}
        onDatesChange={setCustomDates}
        onApply={() => setSelectedRange("custom")}
      />
    </div>
  );
};

export default EmployeeActivityDashboard;