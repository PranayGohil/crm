// EmployeeDashboard.jsx — fully responsive, Bootstrap Modal removed
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
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

const formatDuration = (ms) => {
  const dur = dayjs.duration(Math.max(0, ms));
  return `${dur.hours()}h ${dur.minutes()}m ${dur.seconds()}s`;
};

const buildFilterDates = (f, cr) => {
  const now = dayjs();
  if (f === "Today") return { startDate: now.startOf("day").toISOString(), endDate: now.endOf("day").toISOString() };
  if (f === "This Week") return { startDate: now.startOf("week").toISOString(), endDate: now.endOf("week").toISOString() };
  if (f === "This Month") return { startDate: now.startOf("month").toISOString(), endDate: now.endOf("month").toISOString() };
  if (f === "Custom") return { startDate: dayjs(cr.start).startOf("day").toISOString(), endDate: dayjs(cr.end).endOf("day").toISOString() };
  return {};
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const statusColor = {
  inprogress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  pending: "bg-gray-100 text-gray-600",
  overdue: "bg-red-100 text-red-700",
};
const priorityColor = {
  high: "bg-red-100 text-red-700",
  medium: "bg-orange-100 text-orange-700",
  low: "bg-green-100 text-green-700",
};
const badge = (map, v = "") => map[(v).toLowerCase().replace(" ", "")] ?? "bg-gray-100 text-gray-600";

const StagePill = ({ name, done }) => (
  <span className={`inline-block px-2 py-0.5 text-xs rounded-full border mr-1 mb-1 ${done ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
    {done && "✓ "}{name}
  </span>
);

const ConfirmModal = ({ show, onCancel, onConfirm, title, body, confirmLabel }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{body}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

const PaginationBar = ({ pagination, onPageChange, onLimitChange, loading }) => {
  const { page, totalPages, total, limit } = pagination;
  if (total === 0) return null;
  const start = (page - 1) * limit + 1, end = Math.min(page * limit, total);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
    .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("e"); acc.push(p); return acc; }, []);
  return (
    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-gray-500 order-2 sm:order-1">
          Showing <strong>{start}&ndash;{end}</strong> of <strong>{total}</strong> projects
          {loading && <span className="ml-2 text-blue-500 animate-pulse">↻</span>}
        </span>
        <div className="flex gap-1.5 items-center order-1 sm:order-2 flex-wrap justify-center">
          <button onClick={() => onPageChange(page - 1)} disabled={page <= 1 || loading}
            className="px-3 py-1.5 text-xs rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-40">Prev</button>
          {pages.map((p, i) => p === "e"
            ? <span key={"e" + i} className="px-2 text-xs text-gray-400">...</span>
            : <button key={p} onClick={() => onPageChange(p)} disabled={loading}
              className={"w-8 h-7 text-xs rounded-lg border transition-colors " + (p === page ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50 border-gray-200")}>{p}</button>
          )}
          <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages || loading}
            className="px-3 py-1.5 text-xs rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-40">Next</button>
          <select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}
            className="ml-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white">
            {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}/page</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

const EmployeeDashboard = () => {
  const storedUser = localStorage.getItem("employeeUser");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const currentEmployeeId = currentUser?._id ?? null;
  const { socket } = useSocket();

  const [user, setUser] = useState(null);
  const [rawSubtasks, setRawSubtasks] = useState([]);
  const [rawProjects, setRawProjects] = useState([]);
  const [serverStats, setServerStats] = useState({ completed: "0", timeLogged: "0h 0m" });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [runningTimers, setRunningTimers] = useState({});
  const [selectedFilter, setSelectedFilter] = useState("This Week");
  const [customRange, setCustomRange] = useState({ start: dayjs().format("YYYY-MM-DD"), end: dayjs().format("YYYY-MM-DD") });
  const customRangeReady = selectedFilter !== "Custom" || (!!customRange.start && !!customRange.end);
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [taskStats, setTaskStats] = useState([
    { icon: "/SVG/clipboard.svg", alt: "total", bgClass: "bg-purple-100", label: "Total Tasks", value: "0" },
    { icon: "/SVG/true-yellow.svg", alt: "completed", bgClass: "bg-yellow-100", label: "Completed", value: "0", link: "/completed-tasks" },
    { icon: "/SVG/time-blue.svg", alt: "time", bgClass: "bg-blue-100", label: "Time Logged", value: "0h 0m", link: "/time-tracking" },
  ]);

  useEffect(() => {
    if (!currentEmployeeId) return;
    axios.get(`${API}/api/employee/get/${currentEmployeeId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }).then((r) => setUser(r.data)).catch(console.error);
  }, [currentEmployeeId]);

  const fetchDashboardData = useCallback(async (pageOverride, limitOverride) => {
    if (!currentEmployeeId || !customRangeReady) return;
    setLoading(true);
    try {
      const fp = buildFilterDates(selectedFilter, customRange);
      const { data } = await axios.get(`${API}/api/employee/dashboard/${currentEmployeeId}`, {
        params: { ...fp, page: pageOverride ?? pagination.page, limit: limitOverride ?? pagination.limit },
      });
      setRawSubtasks(data.subtasks ?? []);
      setRawProjects(data.projects ?? []);
      setServerStats({ completed: data.completed ?? "0", timeLogged: data.timeLogged ?? "0h 0m" });
      setPagination(data.pagination);
      const timers = {};
      (data.subtasks ?? []).forEach((task) => {
        const ol = (task.time_logs ?? []).slice().reverse()
          .find((log) => !log.end_time && (log.user_id?.toString?.() || log.user_id) === currentEmployeeId);
        if (ol) timers[task._id] = dayjs().diff(dayjs(ol.start_time));
      });
      setRunningTimers(timers);
      setExpandedProjectId(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message ?? "Failed to fetch dashboard.");
    } finally { setLoading(false); }
  }, [currentEmployeeId, selectedFilter, customRange, customRangeReady]); // eslint-disable-line

  useEffect(() => { fetchDashboardData(1, pagination.limit); }, [selectedFilter, customRange]); // eslint-disable-line

  const fetchRef = useRef(fetchDashboardData);
  useEffect(() => { fetchRef.current = fetchDashboardData; }, [fetchDashboardData]);
  useEffect(() => {
    if (!socket) return;
    const h = () => fetchRef.current(1, pagination.limit);
    socket.on("new_subtask", h); socket.on("subtask_updated", h);
    return () => { socket.off("new_subtask", h); socket.off("subtask_updated", h); };
  }, [socket]); // eslint-disable-line

  useEffect(() => {
    const id = setInterval(() => {
      setRunningTimers((p) => { const n = { ...p }; Object.keys(n).forEach((k) => { n[k] += 1000; }); return n; });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const filteredSubtasks = useMemo(() => {
    let r = rawSubtasks;
    if (statusFilter !== "All") {
      r = r.filter((t) => {
        const aid = t.assign_to?.toString?.() || t.assign_to;
        const showC = (!aid && t.completedByEmployee) || (aid && aid !== currentEmployeeId && t.completedByEmployee);
        return (showC ? "Completed" : t.status || "").toLowerCase() === statusFilter.toLowerCase();
      });
    }
    if (priorityFilter !== "All") r = r.filter((t) => (t.priority || "").toLowerCase() === priorityFilter.toLowerCase());
    return r;
  }, [rawSubtasks, statusFilter, priorityFilter, currentEmployeeId]);

  const filteredProjects = useMemo(() =>
    rawProjects.filter((p) => filteredSubtasks.some((s) =>
      s.project_id === p._id || s.project_id?._id === p._id ||
      s.project_id?._id?.toString() === p._id?.toString()
    )), [rawProjects, filteredSubtasks]);

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

  useEffect(() => {
    setTaskStats((p) => [
      { ...p[0], value: String(filteredSubtasks.length) },
      { ...p[1], value: String(serverStats.completed) },
      { ...p[2], value: serverStats.timeLogged },
    ]);
  }, [filteredSubtasks.length, serverStats]);

  const handlePageChange = useCallback((pg) => { if (pg < 1 || pg > pagination.totalPages) return; fetchDashboardData(pg, pagination.limit); }, [fetchDashboardData, pagination]);
  const handleLimitChange = useCallback((l) => { fetchDashboardData(1, l); }, [fetchDashboardData]);
  const toggleTable = useCallback((pid) => setExpandedProjectId((p) => p === pid ? null : pid), []);

  const handleChangeStatus = useCallback(async (task, status) => {
    if (status === "Completed") { setSelectedTask(task); setShowCompleteModal(true); return; }
    setSelectedTask(null);
    try {
      const u = JSON.parse(localStorage.getItem("employeeUser"));
      await axios.put(`${API}/api/subtask/change-status/${task._id}`, { status, userId: u._id, userRole: "employee" });
      fetchRef.current();
    } catch (err) { toast.error(err.response?.data?.message ?? "Failed to change status."); }
  }, []);

  const completeStage = useCallback(async (task) => {
    try {
      await axios.put(`${API}/api/subtask/complete-stage/${task._id}`);
      toast.success("Stage marked as completed!");
      fetchRef.current();
    } catch { toast.error("Failed to complete stage"); }
    finally { setShowCompleteModal(false); }
  }, []);

  const handleCopyToClipboard = useCallback((url, e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.ctrlKey || e.metaKey) { window.open(url, "_blank", "noopener,noreferrer"); return; }
    navigator.clipboard.writeText(url).then(() => toast.success("URL copied!")).catch(() => toast.error("Failed to copy URL."));
  }, []);

  // Subtask content — shared between desktop table row and mobile card
  const getSubtaskData = (task) => {
    let totalMs = 0; let isRunning = false;
    (task.time_logs ?? []).forEach((log) => {
      const lid = log.user_id?.toString?.() || log.user_id;
      if (lid !== currentEmployeeId) return;
      totalMs += (log.end_time ? dayjs(log.end_time) : dayjs()).diff(dayjs(log.start_time));
      if (!log.end_time) isRunning = true;
    });
    if (isRunning && runningTimers[task._id]) {
      const ol = (task.time_logs ?? []).find((l) => !l.end_time && (l.user_id?.toString?.() || l.user_id) === currentEmployeeId);
      if (ol) { totalMs -= dayjs().diff(dayjs(ol.start_time)); totalMs += runningTimers[task._id]; }
    }
    const runMs = runningTimers[task._id] ?? 0;
    const anotherRunning = Object.entries(runningTimers).some(([id, ms]) => id !== task._id && ms > 0);
    const aid = task.assign_to?.toString?.() || task.assign_to;
    const showC = (!aid && task.completedByEmployee) || (aid && aid !== currentEmployeeId && task.completedByEmployee);
    const displayStatus = showC ? "Completed" : task.status || "No Status";
    return { totalMs, runMs, anotherRunning, showC, displayStatus };
  };

  const getStages = (task) => {
    if (task.employeeCompletedStages?.length > 0) return (
      <div className="flex flex-wrap gap-0.5">
        {task.employeeCompletedStages.map((n, i) => <StagePill key={i} name={n} done />)}
        {task.currentStageAssignedToEmployee && <StagePill name={task.stages[task.current_stage_index]?.name} done={false} />}
      </div>
    );
    if (Array.isArray(task.stages) && task.stages.length > 0 && task.current_stage_index !== undefined) {
      const st = task.stages[task.current_stage_index];
      return <StagePill name={typeof st === "string" ? st : st.name} done={!!st?.completed} />;
    }
    return <span className="text-gray-400 text-xs">No stage</span>;
  };

  const isAssignedToday = (date) => {
    if (!date) return false;
    return dayjs(date).isSame(dayjs(), "day");
  };

  if (loading && !rawProjects.length) return <LoadingOverlay />;

  const dateFilters = ["All Time", "Today", "This Week", "This Month", "Custom"];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 space-y-4">

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-semibold text-gray-800">Task Board</h1>
            <p className="text-sm text-gray-500">Manage your jewelry production workflow</p>
          </div>
          {user?.reporting_manager?.full_name && (
            <div className="sm:text-right">
              <p className="text-xs text-gray-500">Reported By</p>
              <p className="text-sm font-semibold text-gray-800">{user.reporting_manager.full_name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Date filters + stat cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {dateFilters.map((label) => (
            <button key={label} onClick={() => setSelectedFilter(label)}
              className={"px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors " +
                (selectedFilter === label ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}>
              {label}
            </button>
          ))}
        </div>
        {selectedFilter === "Custom" && (
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="date" value={customRange.start} onChange={(e) => setCustomRange((p) => ({ ...p, start: e.target.value }))}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            <input type="date" value={customRange.end} onChange={(e) => setCustomRange((p) => ({ ...p, end: e.target.value }))}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {taskStats.map((item, idx) => {
            const card = (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center gap-3 hover:border-blue-200 transition-colors">
                <div className={"w-10 h-10 sm:w-12 sm:h-12 " + item.bgClass + " rounded-lg flex items-center justify-center flex-shrink-0"}>
                  <img src={item.icon} alt={item.alt} className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-800">{item.value}</p>
                </div>
              </div>
            );
            return <div key={idx}>{item.link ? <Link to={item.link}>{card}</Link> : card}</div>;
          })}
        </div>
      </div>

      {/* Status / Priority filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Filter by Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500">
              <option value="All">All Status</option>
              {statusOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Filter by Priority</label>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500">
              <option value="All">All Priority</option>
              {priorityOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Projects table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {/* DESKTOP table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["", "Project Name", "Status", "Subtasks", "Total Time", "Priority", "Start Date", "End Date", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProjects.length === 0 && !loading && (
                <tr><td colSpan={9} className="text-center py-10 text-sm text-gray-400">No tasks found for the selected filters.</td></tr>
              )}
              {filteredProjects.map((project) => {
                const pid = project._id?.toString();
                const ps = subtasksByProject[pid] ?? [];
                const hasNewTask = ps.some(task =>
                  isAssignedToday(task.stages[task.current_stage_index]?.assign_at)
                );
                const hasRunning = ps.some((t) => t.status === "In Progress" && runningTimers[t._id]);
                const totalMs = ps.reduce((acc, task) => {
                  let ms = 0;
                  (task.time_logs ?? []).forEach((log) => { ms += (log.end_time ? dayjs(log.end_time) : dayjs()).diff(dayjs(log.start_time)); });
                  if (task.status === "In Progress" && runningTimers[task._id]) {
                    const ol = (task.time_logs ?? []).find((l) => !l.end_time);
                    if (ol) { ms -= dayjs().diff(dayjs(ol.start_time)); ms += runningTimers[task._id]; }
                  }
                  return acc + ms;
                }, 0);
                return (
                  <React.Fragment key={project._id}>
                    <tr className={"hover:bg-gray-50 transition-colors " + (hasRunning ? "border-2 border-green-400 bg-green-50" : "")}>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleTable(project._id)}
                          className={"w-7 h-7 flex items-center justify-center rounded-lg border hover:bg-gray-100 transition-all " + (expandedProjectId === project._id ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200")}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            className={"transition-transform duration-200 " + (expandedProjectId === project._id ? "rotate-180" : "")}>
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </button>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{project.project_name}</span>

                          {hasNewTask && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-red-600 text-white">
                              NEW
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className={"px-2 py-0.5 text-xs rounded-full font-medium " + badge(statusColor, project.status)}>{project.status}</span></td>
                      <td className="px-4 py-3 text-center text-gray-700">{ps.length}</td>
                      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-gray-700">{formatDuration(totalMs)}</td>
                      <td className="px-4 py-3"><span className={"px-2 py-0.5 text-xs rounded-full font-medium " + badge(priorityColor, project.priority)}>{project.priority}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{project.assign_date ? dayjs(project.assign_date).format("DD/MM/YYYY") : "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{project.due_date ? dayjs(project.due_date).format("DD/MM/YYYY") : "—"}</td>
                      <td className="px-4 py-3">
                        <Link to={`/project/details/${project._id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-blue-50 transition-colors">
                          <img src="/SVG/eye-view.svg" alt="view" className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>

                    {expandedProjectId === project._id && (
                      <tr>
                        <td colSpan={9} className="bg-gray-50 px-4 py-3">
                          <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full text-xs divide-y divide-gray-100">
                              <thead className="bg-gray-100">
                                <tr>
                                  {["Subtask Name", "Assign at", "Start", "End", "Priority", "Status", "Stage", "URL", "Timer", "Time Tracked", ""].map((h) => (
                                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className=" bg-white">
                                {ps.map((task) => {
                                  const { totalMs, runMs, anotherRunning, showC, displayStatus } = getSubtaskData(task);
                                  return (
                                    <tr key={task._id} className={"hover:bg-blue-50 transition-colors " + (task.status === "In Progress" && runMs ? "border-2 border-green-400 bg-green-50" : "")}>
                                      <td className="px-3 py-2 font-medium text-gray-800 max-w-[160px]">
                                        <div className="flex items-center gap-2">
                                          <span className="block truncate" title={task.task_name}>
                                            {task.task_name}
                                          </span>

                                          {isAssignedToday(task.stages[task.current_stage_index]?.assign_at) && (
                                            <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-red-600 text-white">
                                              NEW
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-gray-600">{task.stages[task.current_stage_index]?.assign_at ? dayjs(task.stages[task.current_stage_index].assign_at).format("DD/MM/YY") : "—" ?? "No log"}</td>
                                      <td className="px-3 py-2 whitespace-nowrap text-gray-600">{task.assign_date ? dayjs(task.assign_date).format("DD/MM/YY") : "—"}</td>
                                      <td className="px-3 py-2 whitespace-nowrap text-gray-600">{task.due_date ? dayjs(task.due_date).format("DD/MM/YY") : "—"}</td>
                                      <td className="px-3 py-2"><span className={"px-2 py-0.5 rounded-full font-medium " + badge(priorityColor, task.priority)}>{task.priority}</span></td>
                                      <td className="px-3 py-2">
                                        {showC && !task.currentStageAssignedToEmployee
                                          ? <span className={"px-2 py-0.5 rounded-full font-medium " + badge(statusColor, displayStatus)}>{displayStatus}</span>
                                          : <select value={displayStatus} onChange={(e) => handleChangeStatus(task, e.target.value)}
                                            className={"px-2 py-1 rounded-lg border text-xs font-medium focus:ring-1 focus:ring-blue-500 " + badge(statusColor, displayStatus)}>
                                            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                                          </select>
                                        }
                                      </td>
                                      <td className="px-3 py-2 max-w-[160px]">{getStages(task)}</td>
                                      <td className="px-3 py-2 max-w-[140px]">
                                        {task.url
                                          ? <div className="flex items-center gap-1 cursor-pointer text-blue-600 hover:text-blue-800"
                                            onClick={(e) => handleCopyToClipboard(task.url, e)} title="Click to copy. Ctrl+Click to open.">
                                            <span className="block truncate max-w-[100px] text-xs">{task.url}</span>
                                            <img src="/SVG/clipboard.svg" alt="copy" className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                                          </div>
                                          : <span className="text-gray-400">—</span>}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap">
                                        {task.status === "In Progress" || !anotherRunning
                                          ? <button onClick={() => handleChangeStatus(task, task.status === "In Progress" ? "Paused" : "In Progress")}
                                            className={"flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors " + (task.status === "In Progress" ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200")}>
                                            <img src={task.status === "In Progress" ? "/SVG/pause.svg" : "/SVG/start.svg"} alt="toggle" className="w-3 h-3" />
                                            {task.status === "In Progress" ? formatDuration(runMs) : "Start"}
                                          </button>
                                          : <span className="text-gray-400">—</span>}
                                      </td>
                                      <td className="px-3 py-2 font-mono whitespace-nowrap text-gray-700">{formatDuration(totalMs)}</td>
                                      <td className="px-3 py-2">
                                        <Link to={`/subtask/view/${task._id}`} className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 hover:bg-blue-50 transition-colors">
                                          <img src="/SVG/eye-view.svg" alt="view" className="w-3.5 h-3.5" />
                                        </Link>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* MOBILE project cards */}
        <div className="lg:hidden divide-y divide-gray-100">
          {filteredProjects.length === 0 && !loading && (
            <div className="p-8 text-center text-sm text-gray-400">No tasks found for the selected filters.</div>
          )}
          {filteredProjects.map((project) => {
            const pid = project._id?.toString();
            const ps = subtasksByProject[pid] ?? [];
            const hasNewTask = ps.some(task =>
              isAssignedToday(task.stages[task.current_stage_index]?.assign_at)
            );
            const isOpen = expandedProjectId === project._id;
            const hasRunning = ps.some((t) => t.status === "In Progress" && runningTimers[t._id]);
            const totalMs = ps.reduce((acc, task) => {
              let ms = 0;
              (task.time_logs ?? []).forEach((log) => { ms += (log.end_time ? dayjs(log.end_time) : dayjs()).diff(dayjs(log.start_time)); });
              return acc + ms;
            }, 0);

            return (
              <div key={project._id} className={hasRunning ? "border-2 border-green-400 bg-green-50" : "bg-white"}>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left" onClick={() => toggleTable(project._id)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={"flex-shrink-0 text-gray-400 transition-transform duration-200 " + (isOpen ? "rotate-180" : "")}>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="relative">
                      <p className="font-semibold text-sm text-gray-800 truncate">{project.project_name}</p>
                      {hasNewTask && (
                        <span className="absolute top-[-10px] left-[-45px] px-1.5 py-0.5 text-[10px] font-semibold rounded bg-red-600 text-white">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={"px-2 py-0.5 text-xs rounded-full font-medium " + badge(statusColor, project.status)}>{project.status}</span>
                      <span className={"px-2 py-0.5 text-xs rounded-full font-medium " + badge(priorityColor, project.priority)}>{project.priority}</span>
                      <span className="text-xs text-gray-500">{ps.length} subtasks</span>
                      <span className="text-xs font-mono text-gray-500">{formatDuration(totalMs)}</span>
                    </div>
                  </div>
                  <Link to={`/project/details/${project._id}`} onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-blue-50 transition-colors">
                    <img src="/SVG/eye-view.svg" alt="view" className="w-4 h-4" />
                  </Link>
                </button>

                {isOpen && (
                  <div className="px-4 pb-3 space-y-2">
                    {ps.map((task) => {
                      const { totalMs, runMs, anotherRunning, showC, displayStatus } = getSubtaskData(task);
                      return (
                        <div key={task._id} className={"rounded-xl p-3 space-y-2 " + (task.status === "In Progress" && runMs ? "border-2 border-green-400 bg-green-50" : "border-2 border-gray-200 bg-white")}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-gray-800">{task.task_name}</span>

                              {isAssignedToday(task.stages[task.current_stage_index]?.assign_at) && (
                                <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-red-600 text-white">
                                  NEW
                                </span>
                              )}
                            </div>
                            <Link to={`/subtask/view/${task._id}`} onClick={(e) => e.stopPropagation()}
                              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-blue-50 transition-colors">
                              <img src="/SVG/eye-view.svg" alt="view" className="w-3.5 h-3.5" />
                            </Link>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className={"px-2 py-0.5 rounded-full font-medium " + badge(priorityColor, task.priority)}>{task.priority}</span>
                            {showC && !task.currentStageAssignedToEmployee
                              ? <span className={"px-2 py-0.5 rounded-full font-medium " + badge(statusColor, displayStatus)}>{displayStatus}</span>
                              : <select value={displayStatus} onChange={(e) => handleChangeStatus(task, e.target.value)}
                                className={"px-2 py-0.5 rounded-lg border text-xs font-medium focus:ring-1 focus:ring-blue-500 " + badge(statusColor, displayStatus)}>
                                {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                              </select>
                            }
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>📅 {task.due_date ? dayjs(task.due_date).format("DD/MM/YYYY") : "—"}</span>
                            <span className="font-mono">⏱ {formatDuration(totalMs)}</span>
                          </div>

                          <div>{getStages(task)}</div>

                          {(task.status === "In Progress" || !anotherRunning) && (
                            <button onClick={() => handleChangeStatus(task, task.status === "In Progress" ? "Paused" : "In Progress")}
                              className={"w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium transition-colors " + (task.status === "In Progress" ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200")}>
                              <img src={task.status === "In Progress" ? "/SVG/pause.svg" : "/SVG/start.svg"} alt="toggle" className="w-3.5 h-3.5" />
                              {task.status === "In Progress" ? "Pause  " + formatDuration(runMs) : "Start Timer"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <PaginationBar pagination={pagination} onPageChange={handlePageChange} onLimitChange={handleLimitChange} loading={loading} />
      </div>

      <ConfirmModal show={showCompleteModal}
        onCancel={() => { setSelectedTask(null); setShowCompleteModal(false); }}
        onConfirm={() => completeStage(selectedTask)}
        title="Confirm Complete" body="Confirm that you completed the task?" confirmLabel="Complete" />
    </div>
  );
};

export default EmployeeDashboard;