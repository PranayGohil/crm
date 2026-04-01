import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";
import {
  useDebounce,
  RANGE_OPTIONS,
} from "../../../hooks/useEmployeeData";

const API = process.env.REACT_APP_API_URL;

const ACTIVITY_TYPES = [
  { key: "all", label: "All Activities" },
  { key: "task_started", label: "Tasks Started" },
  { key: "task_paused", label: "Tasks Paused" },
  { key: "stage_completed", label: "Stages Completed" },
  { key: "task_assigned", label: "Tasks Assigned" },
];

const ACTIVITY_CONFIG = {
  task_started: { icon: "▶️", color: "text-emerald-600", dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700", label: "Started Task" },
  task_paused: { icon: "⏸️", color: "text-amber-600", dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700", label: "Paused Task" },
  status_changed: { icon: "🔄", color: "text-blue-600", dot: "bg-blue-500", chip: "bg-blue-50 text-blue-700", label: "Status Changed" },
  stage_completed: { icon: "✅", color: "text-violet-600", dot: "bg-violet-500", chip: "bg-violet-50 text-violet-700", label: "Stage Completed" },
  task_assigned: { icon: "📌", color: "text-pink-600", dot: "bg-pink-500", chip: "bg-pink-50 text-pink-700", label: "Task Assigned" },
};

const getConfig = (type) =>
  ACTIVITY_CONFIG[type] ?? {
    icon: "📝", color: "text-gray-600", dot: "bg-gray-400",
    chip: "bg-gray-100 text-gray-600", label: type,
  };

// ── Pure Tailwind custom date modal (replaces CustomDateModal from hook) ──────
const CustomDateModal = ({ show, onHide, dates, onDatesChange, onApply }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Select Custom Date Range</h3>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input type="date" value={dates.from}
              onChange={(e) => onDatesChange((p) => ({ ...p, from: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input type="date" value={dates.to}
              onChange={(e) => onDatesChange((p) => ({ ...p, to: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onHide}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button onClick={() => { onApply(); onHide(); }}
            disabled={!dates.from && !dates.to}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Pagination bar ────────────────────────────────────────────────────────────
const PaginationBar = ({ pagination, onPageChange, onLimitChange, loading }) => {
  const { page, totalPages, limit } = pagination;
  if (totalPages <= 1 && limit === 50) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
    .reduce((acc, p, i, arr) => {
      if (i > 0 && p - arr[i - 1] > 1) acc.push("e");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-200">
      <p className="text-xs text-gray-500 order-2 sm:order-1">Page {page} of {totalPages}</p>
      <div className="flex gap-1.5 items-center order-1 sm:order-2 flex-wrap justify-center">
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1 || loading}
          className="px-3 py-1.5 text-xs rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors">
          Prev
        </button>
        {pages.map((p, i) =>
          p === "e"
            ? <span key={"e" + i} className="px-2 text-xs text-gray-400">…</span>
            : <button key={p} onClick={() => onPageChange(p)} disabled={loading}
              className={"w-8 h-7 text-xs rounded-lg border transition-colors " +
                (p === page ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50 border-gray-200")}>
              {p}
            </button>
        )}
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages || loading}
          className="px-3 py-1.5 text-xs rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors">
          Next
        </button>
        <select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}
          className="ml-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500">
          {[20, 50, 100].map((n) => <option key={n} value={n}>{n}/page</option>)}
        </select>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const EmployeeActivityDashboard = () => {
  const navigate = useNavigate();
  const employeeId = useParams().id;

  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ totalActivities: 0, tasksStarted: 0, tasksPaused: 0, tasksCompleted: 0, totalTimeSpent: 0 });
  const [uniqueProjects, setUniqueProjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });

  const [selectedRange, setSelectedRange] = useState("week");
  const [customDates, setCustomDates] = useState({ from: "", to: "" });
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [activityType, setActivityType] = useState("all");
  const [projectSearch, setProjectSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(projectSearch);

  const fetchData = useCallback(async (page = 1, limit = pagination.limit) => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit,
        range: selectedRange,
        type: activityType,
        ...(debouncedSearch && { project: debouncedSearch }),
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
  }, [employeeId, selectedRange, customDates, activityType, debouncedSearch]);

  useEffect(() => {
    fetchData(1, pagination.limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRange, customDates, activityType, debouncedSearch]);

  // Group activities by calendar date
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

  const rangeOpts = RANGE_OPTIONS ?? [
    { key: "today", label: "Today" }, { key: "week", label: "This Week" },
    { key: "month", label: "This Month" }, { key: "all", label: "All Time" },
    { key: "custom", label: "Custom" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 space-y-4">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-semibold text-gray-800">Activity Dashboard</h1>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Complete history of all your task activities</p>
          </div>
        </div>
      </div>

      {/* ── Filters card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4">

        {/* Time range pills */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Time Period</p>
          <div className="flex flex-wrap gap-2">
            {rangeOpts.map(({ key, label }) => (
              <button key={key}
                onClick={() => key === "custom" ? setShowCustomModal(true) : setSelectedRange(key)}
                className={"px-3 py-1.5 text-xs rounded-full border transition-colors whitespace-nowrap font-medium " +
                  (selectedRange === key
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-blue-400")}>
                {label}
                {key === "custom" && selectedRange === "custom" && customDates.from && (
                  <span className="ml-1 opacity-75 hidden sm:inline">({customDates.from} → {customDates.to || "…"})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Activity type + project search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Activity Type</label>
            <select value={activityType} onChange={(e) => setActivityType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500">
              {ACTIVITY_TYPES.map(({ key, label }) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Search Project</label>
            <div className="relative">
              <input type="text" placeholder="Type project name…" value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              {projectSearch && (
                <button onClick={() => setProjectSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-base leading-none">
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stat chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: "Total Activities", value: stats.totalActivities, cls: "text-gray-800" },
            { label: "Tasks Started", value: stats.tasksStarted, cls: "text-emerald-600" },
            { label: "Tasks Paused", value: stats.tasksPaused, cls: "text-amber-600" },
            { label: "Stages Completed", value: stats.tasksCompleted, cls: "text-violet-600" },
          ].map(({ label, value, cls }) => (
            <div key={label} className="bg-gray-50 rounded-xl border border-gray-200 p-3 sm:p-4">
              <p className={"text-xl sm:text-2xl font-bold " + cls}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400">
          Showing <strong className="text-gray-600">{activities.length}</strong> of{" "}
          <strong className="text-gray-600">{pagination.total}</strong> activities
          {loading && <span className="ml-2 text-blue-500 animate-pulse">Updating…</span>}
        </p>
      </div>

      {/* ── Timeline ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Activity Timeline</h2>

        {sortedDates.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
            <svg className="w-12 h-12 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p className="text-sm">No activities found for the selected period.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((dateKey) => {
              const dayActivities = groupedByDate[dateKey];
              const isToday = moment(dateKey).isSame(moment(), "day");
              const isYesterday = moment(dateKey).isSame(moment().subtract(1, "day"), "day");
              const dayLabel = moment(dateKey).format("dddd, MMMM DD, YYYY");
              const prefix = isToday ? "Today — " : isYesterday ? "Yesterday — " : "";

              return (
                <div key={dateKey}>
                  {/* Date header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex flex-col items-center justify-center">
                      <span className="text-sm sm:text-lg font-bold text-blue-600 leading-none">{moment(dateKey).format("DD")}</span>
                      <span className="text-xs text-blue-400 leading-none hidden sm:block">{moment(dateKey).format("MMM")}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-semibold text-gray-800 truncate">{prefix}{dayLabel}</p>
                      <p className="text-xs text-gray-500">{dayActivities.length} {dayActivities.length === 1 ? "activity" : "activities"}</p>
                    </div>
                  </div>

                  {/* Activity entries */}
                  <div className="ml-4 sm:ml-6 pl-3 sm:pl-6 border-l-2 border-gray-200 space-y-3">
                    {dayActivities.map((activity, idx) => {
                      const cfg = getConfig(activity.type);

                      return (
                        <div key={idx} className="relative group">

                          {/* Timeline dot */}
                          <span
                            className={
                              "absolute -left-[14px] sm:-left-[25px] top-4 w-2.5 h-2.5 rounded-full border-2 border-white " +
                              cfg.dot
                            }
                          />

                          <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 sm:p-4 hover:border-blue-200 hover:bg-blue-50 transition-colors">

                            <div className="flex flex-col sm:flex-row items-start gap-3">

                              {/* Icon bubble */}
                              <div
                                className={
                                  "flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-base sm:text-xl " +
                                  cfg.chip
                                }
                              >
                                {cfg.icon}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">

                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span
                                    className={
                                      "text-xs sm:text-sm font-semibold " + cfg.color
                                    }
                                  >
                                    {cfg.label}
                                  </span>

                                  <span className="text-xs text-gray-400">
                                    {moment(activity.timestamp).format("hh:mm A")}
                                  </span>
                                </div>

                                <p
                                  className="text-sm font-medium text-gray-800 break-words mb-0.5"
                                  title={activity.task_name}
                                >
                                  {activity.task_name}
                                </p>

                                <p className="text-xs text-gray-500">
                                  Project:{" "}
                                  <span className="font-medium text-gray-700">
                                    {activity.project_name}
                                  </span>
                                </p>

                                {activity.stage_name && (
                                  <span
                                    className={
                                      "inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full " +
                                      cfg.chip
                                    }
                                  >
                                    {activity.stage_name}
                                  </span>
                                )}

                                {activity.details && (
                                  <div className="mt-2 text-xs text-gray-600 bg-white rounded-lg px-3 py-2 border border-gray-200 break-words">
                                    {activity.details}
                                  </div>
                                )}

                                {activity.duration_seconds > 0 && (
                                  <p className="mt-1.5 text-xs text-gray-500">
                                    ⏱ Duration:{" "}
                                    <span className="font-medium text-gray-700">
                                      {activity.duration}
                                    </span>
                                  </p>
                                )}
                              </div>

                              {/* View link */}
                              {activity.task_id && (
                                <Link
                                  to={`/subtask/view/${activity.task_id}`}
                                  className="self-end sm:self-start flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-colors"
                                >
                                  <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                </Link>
                              )}
                            </div>
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