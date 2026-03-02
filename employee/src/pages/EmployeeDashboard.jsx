// EmployeeDashboard.optimized.jsx
// Adds project-level pagination on top of the previously optimized version.
// The only new pieces vs the last optimized version are:
//   - pagination state (page, limit)
//   - page/limit sent as query params to the API
//   - pagination received and stored from API response
//   - PaginationBar component rendered below the table
//   - page resets to 1 whenever date/filter changes

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useSocket } from "../contexts/SocketContext";
import { statusOptions, priorityOptions } from "../options";
import LoadingOverlay from "../components/LoadingOverlay";

dayjs.extend(duration);

const API = process.env.REACT_APP_API_URL;

// ─── module-level helpers (never recreated) ───────────────────────────────────
const formatDuration = (ms) => {
  const dur = dayjs.duration(Math.max(0, ms));
  return `${dur.hours()}h ${dur.minutes()}m ${dur.seconds()}s`;
};

const buildFilterDates = (selectedFilter, customRange) => {
  const now = dayjs();
  switch (selectedFilter) {
    case "Today":
      return { startDate: now.startOf("day").toISOString(), endDate: now.endOf("day").toISOString() };
    case "This Week":
      return { startDate: now.startOf("week").toISOString(), endDate: now.endOf("week").toISOString() };
    case "This Month":
      return { startDate: now.startOf("month").toISOString(), endDate: now.endOf("month").toISOString() };
    case "Custom":
      return {
        startDate: dayjs(customRange.start).startOf("day").toISOString(),
        endDate: dayjs(customRange.end).endOf("day").toISOString(),
      };
    default:
      return {};
  }
};

// ─── PaginationBar (self-contained, no extra deps) ────────────────────────────
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const PaginationBar = ({ pagination, onPageChange, onLimitChange, loading }) => {
  const { page, totalPages, total, limit } = pagination;
  if (total === 0) return null;

  // Build page number list with ellipsis
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
    .reduce((acc, p, i, arr) => {
      if (i > 0 && p - arr[i - 1] > 1) acc.push("ellipsis");
      acc.push(p);
      return acc;
    }, []);

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderTop: "1px solid #e5e7eb",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      {/* Result count */}
      <span style={{ fontSize: 13, color: "#6b7280" }}>
        Showing <strong>{start}–{end}</strong> of <strong>{total}</strong> projects
        {loading && <span style={{ marginLeft: 8, color: "#3b82f6" }}>↻</span>}
      </span>

      {/* Page buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || loading}
          style={{
            padding: "5px 12px", borderRadius: 6, border: "1px solid #d1d5db",
            background: "#fff", cursor: page <= 1 ? "not-allowed" : "pointer",
            opacity: page <= 1 ? 0.4 : 1, fontSize: 13,
          }}
        >
          ← Prev
        </button>

        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`e${i}`} style={{ color: "#9ca3af", padding: "0 4px" }}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              disabled={loading}
              style={{
                padding: "5px 12px", borderRadius: 6, minWidth: 36,
                border: "1px solid #d1d5db",
                background: p === page ? "#2563eb" : "#fff",
                color: p === page ? "#fff" : "#374151",
                fontWeight: p === page ? 600 : 400,
                cursor: "pointer", fontSize: 13,
              }}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || loading}
          style={{
            padding: "5px 12px", borderRadius: 6, border: "1px solid #d1d5db",
            background: "#fff", cursor: page >= totalPages ? "not-allowed" : "pointer",
            opacity: page >= totalPages ? 0.4 : 1, fontSize: 13,
          }}
        >
          Next →
        </button>

        {/* Per-page selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 12 }}>
          <span style={{ fontSize: 13, color: "#6b7280" }}>Show:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            style={{
              border: "1px solid #d1d5db", borderRadius: 6,
              padding: "5px 8px", fontSize: 13, cursor: "pointer",
            }}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n} projects</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

// ─── main component ───────────────────────────────────────────────────────────
const EmployeeDashboard = () => {
  const storedUser = localStorage.getItem("employeeUser");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const currentEmployeeId = currentUser?._id ?? null;
  const { socket } = useSocket();

  // ── user profile (once) ──────────────────────────────────────────────
  const [user, setUser] = useState(null);

  // ── server data ───────────────────────────────────────────────────────
  const [rawSubtasks, setRawSubtasks] = useState([]);
  const [rawProjects, setRawProjects] = useState([]);
  const [serverStats, setServerStats] = useState({ completed: "0", timeLogged: "0h 0m" });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // ── timers ────────────────────────────────────────────────────────────
  const [runningTimers, setRunningTimers] = useState({});

  // ── date filter ───────────────────────────────────────────────────────
  const [selectedFilter, setSelectedFilter] = useState("This Week");
  const [customRange, setCustomRange] = useState({
    start: dayjs().format("YYYY-MM-DD"),
    end: dayjs().format("YYYY-MM-DD"),
  });
  const customRangeReady =
    selectedFilter !== "Custom" || (!!customRange.start && !!customRange.end);

  // ── UI-only filters (no re-fetch) ─────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // ── ui state ──────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [expandedProjectId, setExpandedProjectId] = useState(null);

  const [taskStats, setTaskStats] = useState([
    { icon: "/SVG/clipboard.svg", alt: "total task", bgClass: "bg-purple-100", label: "Total Tasks", value: "0" },
    { icon: "/SVG/true-yellow.svg", alt: "completed week", bgClass: "bg-yellow-100", label: "Completed", value: "0", link: "/completed-tasks" },
    { icon: "/SVG/time-blue.svg", alt: "time logged", bgClass: "bg-blue-100", label: "Time Logged", value: "0h 0m", link: "/time-tracking" },
  ]);

  // ─── fetch user once ────────────────────────────────────────────────
  useEffect(() => {
    if (!currentEmployeeId) return;
    axios
      .get(`${API}/api/employee/get/${currentEmployeeId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) => console.error("fetchUser error:", err));
  }, [currentEmployeeId]);

  // ─── fetch dashboard (date filter + pagination) ─────────────────────
  const fetchDashboardData = useCallback(
    async (pageOverride, limitOverride) => {
      if (!currentEmployeeId || !customRangeReady) return;
      setLoading(true);
      try {
        const filterParams = buildFilterDates(selectedFilter, customRange);
        const { data } = await axios.get(
          `${API}/api/employee/dashboard/${currentEmployeeId}`,
          {
            params: {
              ...filterParams,
              page: pageOverride ?? pagination.page,
              limit: limitOverride ?? pagination.limit,
            },
          }
        );

        setRawSubtasks(data.subtasks ?? []);
        setRawProjects(data.projects ?? []);
        setServerStats({
          completed: data.completed ?? "0",
          timeLogged: data.timeLogged ?? "0h 0m",
        });
        setPagination(data.pagination);

        // Seed running timers from open logs on this page
        const timers = {};
        (data.subtasks ?? []).forEach((task) => {
          const openLog = (task.time_logs ?? [])
            .slice()
            .reverse()
            .find(
              (log) =>
                !log.end_time &&
                (log.user_id?.toString?.() || log.user_id) === currentEmployeeId
            );
          if (openLog) {
            timers[task._id] = dayjs().diff(dayjs(openLog.start_time));
          }
        });
        setRunningTimers(timers);
        setExpandedProjectId(null);
      } catch (error) {
        console.error("fetchDashboardData error:", error);
        toast.error(error.response?.data?.message ?? "Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentEmployeeId, selectedFilter, customRange, customRangeReady]
  );

  // Re-fetch when date filter changes — always reset to page 1
  useEffect(() => {
    fetchDashboardData(1, pagination.limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter, customRange]);

  // ─── socket ─────────────────────────────────────────────────────────
  const fetchRef = useRef(fetchDashboardData);
  useEffect(() => { fetchRef.current = fetchDashboardData; }, [fetchDashboardData]);

  useEffect(() => {
    if (!socket) return;
    const handle = () => fetchRef.current(1, pagination.limit);
    socket.on("new_subtask", handle);
    socket.on("subtask_updated", handle);
    return () => {
      socket.off("new_subtask", handle);
      socket.off("subtask_updated", handle);
    };
  }, [socket]);

  // ─── 1-second timer tick ─────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setRunningTimers((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((id) => { next[id] += 1000; });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ─── client-side status/priority filter (no re-fetch) ────────────────
  const filteredSubtasks = useMemo(() => {
    let result = rawSubtasks;
    if (statusFilter !== "All") {
      result = result.filter((t) => {
        const assignToId = t.assign_to?.toString?.() || t.assign_to;
        const showCompleted =
          (!assignToId && t.completedByEmployee) ||
          (assignToId && assignToId !== currentEmployeeId && t.completedByEmployee);
        const displayStatus = showCompleted ? "Completed" : t.status || "";
        return displayStatus.toLowerCase() === statusFilter.toLowerCase();
      });
    }
    if (priorityFilter !== "All") {
      result = result.filter(
        (t) => (t.priority || "").toLowerCase() === priorityFilter.toLowerCase()
      );
    }
    return result;
  }, [rawSubtasks, statusFilter, priorityFilter, currentEmployeeId]);

  const filteredProjects = useMemo(
    () =>
      rawProjects.filter((project) =>
        filteredSubtasks.some(
          (s) =>
            s.project_id === project._id ||
            s.project_id?._id === project._id ||
            s.project_id?._id?.toString() === project._id?.toString()
        )
      ),
    [rawProjects, filteredSubtasks]
  );

  // O(1) subtask lookup per project
  const subtasksByProject = useMemo(() => {
    const map = {};
    filteredSubtasks.forEach((s) => {
      const pid = s.project_id?._id?.toString() ?? s.project_id?.toString() ?? s.project_id;
      if (!pid) return;
      if (!map[pid]) map[pid] = [];
      map[pid].push(s);
    });
    return map;
  }, [filteredSubtasks]);

  // Stats card sync
  useEffect(() => {
    setTaskStats((prev) => [
      { ...prev[0], value: String(filteredSubtasks.length) },
      { ...prev[1], value: String(serverStats.completed) },
      { ...prev[2], value: serverStats.timeLogged },
    ]);
  }, [filteredSubtasks.length, serverStats]);

  // ─── pagination handlers ─────────────────────────────────────────────
  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage < 1 || newPage > pagination.totalPages) return;
      fetchDashboardData(newPage, pagination.limit);
    },
    [fetchDashboardData, pagination]
  );

  const handleLimitChange = useCallback(
    (newLimit) => { fetchDashboardData(1, newLimit); },
    [fetchDashboardData]
  );

  // ─── action handlers ─────────────────────────────────────────────────
  const toggleTable = useCallback(
    (pid) => setExpandedProjectId((p) => (p === pid ? null : pid)),
    []
  );

  const handleChangeStatus = useCallback(async (task, status) => {
    if (status === "Completed") {
      setSelectedTask(task);
      setShowCompleteModal(true);
      return;
    }
    setSelectedTask(null);
    try {
      const u = JSON.parse(localStorage.getItem("employeeUser"));
      await axios.put(`${API}/api/subtask/change-status/${task._id}`, {
        status, userId: u._id, userRole: "employee",
      });
      fetchRef.current();
    } catch (error) {
      toast.error(error.response?.data?.message ?? "Failed to change status.");
    }
  }, []);

  const completeStage = useCallback(async (task) => {
    try {
      await axios.put(`${API}/api/subtask/complete-stage/${task._id}`);
      toast.success("Stage marked as completed!");
      fetchRef.current();
    } catch {
      toast.error("Failed to complete stage");
    } finally {
      setShowCompleteModal(false);
    }
  }, []);

  const handleCopyToClipboard = useCallback((url, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) { window.open(url, "_blank", "noopener,noreferrer"); return; }
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("URL copied to clipboard!"))
      .catch(() => toast.error("Failed to copy URL."));
  }, []);

  if (loading && !rawProjects.length) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Task Board</h1>
            <p className="text-gray-600">Manage your jewelry production workflow</p>
          </div>
          {user?.reporting_manager?.full_name && (
            <div className="mt-4 md:mt-0 text-right">
              <h5 className="font-semibold text-gray-800">Reported By</h5>
              <p className="text-gray-600">{user.reporting_manager.full_name}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Date filter + stats ──────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {["All Time", "Today", "This Week", "This Month", "Custom"].map((label) => (
              <button
                key={label}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedFilter === label
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                onClick={() => setSelectedFilter(label)}
              >
                {label}
              </button>
            ))}
          </div>
          {selectedFilter === "Custom" && (
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="date"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={customRange.start}
                onChange={(e) => setCustomRange((p) => ({ ...p, start: e.target.value }))} />
              <input type="date"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={customRange.end}
                onChange={(e) => setCustomRange((p) => ({ ...p, end: e.target.value }))} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-3 mt-6">
          {taskStats.map((item, index) => {
            const content = (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
                <div className={`w-12 h-12 ${item.bgClass} rounded-lg flex items-center justify-center mr-4`}>
                  <img src={item.icon} alt={item.alt} className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{item.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                </div>
              </div>
            );
            return <div key={index}>{item.link ? <Link to={item.link}>{content}</Link> : content}</div>;
          })}
        </div>
      </div>

      {/* ── Status / Priority filters ────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status:</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              {statusOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Priority:</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="All">All Priority</option>
              {priorityOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Projects Table ───────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="time-table-table">
            <thead className="ttb-table-row">
              <tr>
                <th></th>
                <th>Project Name</th><th>Status</th><th>Subtasks</th>
                <th>Total Time</th><th>Priority</th>
                <th>Start Date</th><th>End Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 && !loading && (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-gray-400">
                    No tasks found for the selected filters.
                  </td>
                </tr>
              )}

              {filteredProjects.map((project) => {
                const pid = project._id?.toString();
                const projectSubtasks = subtasksByProject[pid] ?? [];
                const hasRunning = projectSubtasks.some(
                  (t) => t.status === "In Progress" && runningTimers[t._id]
                );

                const totalProjectMs = projectSubtasks.reduce((acc, task) => {
                  let ms = 0;
                  (task.time_logs ?? []).forEach((log) => {
                    ms += (log.end_time ? dayjs(log.end_time) : dayjs()).diff(dayjs(log.start_time));
                  });
                  if (task.status === "In Progress" && runningTimers[task._id]) {
                    const openLog = (task.time_logs ?? []).find((l) => !l.end_time);
                    if (openLog) {
                      ms -= dayjs().diff(dayjs(openLog.start_time));
                      ms += runningTimers[task._id];
                    }
                  }
                  return acc + ms;
                }, 0);

                return (
                  <React.Fragment key={project._id}>
                    <tr className={`time-table-row ${hasRunning ? "highlight-running" : ""}`}>
                      <td>
                        <img src="/SVG/arrow.svg" alt="arrow"
                          className={`time-table-toggle-btn ${expandedProjectId === project._id ? "rotate-down" : ""}`}
                          onClick={() => toggleTable(project._id)} />
                      </td>
                      <td>{project.project_name}</td>
                      <td>
                        <span className={`time-table-badge md-status-${(project.status || "").toLowerCase().replace(" ", "")}`}>
                          {project.status}
                        </span>
                      </td>
                      <td>{projectSubtasks.length}</td>
                      <td>{formatDuration(totalProjectMs)}</td>
                      <td>
                        <span className={`time-table-badge md-status-${(project.priority || "").toLowerCase()}`}>
                          {project.priority}
                        </span>
                      </td>
                      <td>{project.assign_date ? dayjs(project.assign_date).format("DD/MM/YYYY") : "-"}</td>
                      <td>{project.due_date ? dayjs(project.due_date).format("DD/MM/YYYY") : "-"}</td>
                      <td>
                        <Link to={`/project/details/${project._id}`}>
                          <img src="/SVG/eye-view.svg" alt="view" />
                        </Link>
                      </td>
                    </tr>

                    {/* Subtasks expand */}
                    <tr className={`time-table-subtask-row ${expandedProjectId === project._id ? "" : "time-table-hidden"}`}>
                      <td colSpan="10">
                        <table className="time-table-subtable time-table-subtable-left">
                          <thead>
                            <tr>
                              <th></th><th>Subtask Name</th><th>Start</th><th>End</th>
                              <th>Priority</th><th>Status</th><th>Stage</th>
                              <th>URL</th><th>Timer</th><th>Time Tracked</th><th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {projectSubtasks.map((task) => {
                              let totalMs = 0;
                              let isRunning = false;

                              (task.time_logs ?? []).forEach((log) => {
                                const logUserId = log.user_id?.toString?.() || log.user_id;
                                if (logUserId !== currentEmployeeId) return;
                                totalMs += (log.end_time ? dayjs(log.end_time) : dayjs()).diff(dayjs(log.start_time));
                                if (!log.end_time) isRunning = true;
                              });

                              if (isRunning && runningTimers[task._id]) {
                                const openLog = (task.time_logs ?? []).find(
                                  (l) => !l.end_time && (l.user_id?.toString?.() || l.user_id) === currentEmployeeId
                                );
                                if (openLog) {
                                  totalMs -= dayjs().diff(dayjs(openLog.start_time));
                                  totalMs += runningTimers[task._id];
                                }
                              }

                              const runningMs = runningTimers[task._id] ?? 0;
                              const runningTimeDisplay = formatDuration(runningMs);
                              const timeTrackedDisplay = formatDuration(totalMs);
                              const anotherTaskRunning = Object.entries(runningTimers).some(
                                ([id, ms]) => id !== task._id && ms > 0
                              );

                              const assignToId = task.assign_to?.toString?.() || task.assign_to;
                              const showCompletedForEmployee =
                                (!assignToId && task.completedByEmployee) ||
                                (assignToId && assignToId !== currentEmployeeId && task.completedByEmployee);
                              const displayStatus = showCompletedForEmployee ? "Completed" : task.status || "-";

                              return (
                                <tr key={task._id}
                                  className={`subtask-row ${task.status === "In Progress" && runningTimers[task._id] ? "highlight-running" : ""}`}>
                                  <td></td>
                                  <td>{task.task_name}</td>
                                  <td>{task.assign_date ? dayjs(task.assign_date).format("DD/MM/YYYY") : "-"}</td>
                                  <td>{task.due_date ? dayjs(task.due_date).format("DD/MM/YYYY") : "-"}</td>
                                  <td>
                                    <span className={`time-table-badge md-status-${(task.priority || "").toLowerCase()}`}>
                                      {task.priority}
                                    </span>
                                  </td>

                                  {/* Status */}
                                  <td>
                                    {showCompletedForEmployee && !task.currentStageAssignedToEmployee ? (
                                      <span className={`time-table-badge md-status-${displayStatus.toLowerCase().replace(" ", "")}`}>
                                        {displayStatus}
                                      </span>
                                    ) : (
                                      <select
                                        className={`time-table-badge md-status-${displayStatus.toLowerCase().replace(" ", "")}`}
                                        value={displayStatus}
                                        onChange={(e) => handleChangeStatus(task, e.target.value)}
                                        style={{ minWidth: 100, padding: "4px 6px", borderRadius: 6 }}
                                      >
                                        {statusOptions.map((s) => (
                                          <option key={s} value={s} className={`md-status-${s.toLowerCase().replace(" ", "")}`}>{s}</option>
                                        ))}
                                      </select>
                                    )}
                                  </td>

                                  {/* Stage */}
                                  <td>
                                    {task.employeeCompletedStages?.length > 0 ? (
                                      <div>
                                        {task.employeeCompletedStages.map((name, idx) => (
                                          <small key={idx} style={{ display: "inline-block", marginRight: 6, padding: "4px 10px", borderRadius: 12, background: "#e6ffed", color: "#097a3f", border: "1px solid #b7f0c6", fontSize: 12 }}>
                                            ✓ {name}
                                          </small>
                                        ))}
                                        {task.currentStageAssignedToEmployee && (
                                          <small style={{ padding: "6px 12px", borderRadius: 12, background: "#f3f4f6", color: "#444", border: "1px solid #e0e0e0", fontSize: 12 }}>
                                            {task.stages[task.current_stage_index]?.name}
                                          </small>
                                        )}
                                      </div>
                                    ) : Array.isArray(task.stages) && task.stages.length > 0 && task.current_stage_index !== undefined ? (
                                      (() => {
                                        const st = task.stages[task.current_stage_index];
                                        const name = typeof st === "string" ? st : st.name;
                                        const done = st?.completed;
                                        return (
                                          <small style={{ padding: "6px 12px", borderRadius: 12, background: done ? "#e6ffed" : "#f3f4f6", color: done ? "#097a3f" : "#444", border: `1px solid ${done ? "#b7f0c6" : "#e0e0e0"}`, fontSize: 12 }}>
                                            {done ? "✓ " : ""}{name}
                                          </small>
                                        );
                                      })()
                                    ) : "No current stage"}
                                  </td>

                                  {/* URL */}
                                  <td style={{ width: 200, position: "relative" }}>
                                    {task.url ? (
                                      <div
                                        style={{ display: "flex", alignItems: "center", width: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer", color: "#007bff", paddingRight: 20, position: "relative" }}
                                        onClick={(e) => handleCopyToClipboard(task.url, e)}
                                        title="Click to copy. Ctrl+Click to open."
                                      >
                                        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{task.url}</span>
                                        <span style={{ position: "absolute", right: 2, top: "50%", transform: "translateY(-50%)" }}>
                                          <img src="/SVG/clipboard.svg" alt="copy" style={{ width: 16, height: 16, filter: "hue-rotate(310deg)", opacity: 0.8 }} />
                                        </span>
                                      </div>
                                    ) : <small>No URL</small>}
                                  </td>

                                  {/* Timer */}
                                  <td className="ttb-table-pause">
                                    {task.status === "In Progress" || !anotherTaskRunning ? (
                                      <div
                                        className={`ttb-table-pause-inner ${task.status === "In Progress" ? "ttb-stop-bg-color" : "ttb-start-bg-color"}`}
                                        onClick={() => handleChangeStatus(task, task.status === "In Progress" ? "Paused" : "In Progress")}
                                        style={{ cursor: "pointer" }}
                                      >
                                        <span className="ttb-table-pasuse-btn-containter">
                                          <img src={task.status === "In Progress" ? "/SVG/pause.svg" : "/SVG/start.svg"} alt="toggle" />
                                          <span>{task.status === "In Progress" ? runningTimeDisplay : "Start"}</span>
                                        </span>
                                      </div>
                                    ) : "-"}
                                  </td>

                                  <td>{timeTrackedDisplay}</td>
                                  <td className="time-table-icons">
                                    <Link to={`/subtask/view/${task._id}`}>
                                      <img src="/SVG/eye-view.svg" alt="view" />
                                    </Link>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination bar ──────────────────────────────────────────── */}
        <PaginationBar
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          loading={loading}
        />
      </div>

      {/* ── Complete Modal ───────────────────────────────────────────── */}
      <Modal show={showCompleteModal}
        onHide={() => { setSelectedTask(null); setShowCompleteModal(false); }}
        centered>
        <Modal.Header closeButton><Modal.Title>Confirm Complete</Modal.Title></Modal.Header>
        <Modal.Body>Confirm that you completed the task?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setSelectedTask(null); setShowCompleteModal(false); }}>Cancel</Button>
          <Button variant="success" onClick={() => completeStage(selectedTask)}>Complete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EmployeeDashboard;