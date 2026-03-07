import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import LoadingOverlay from "../../components/admin/LoadingOverlay";

const API = process.env.REACT_APP_API_URL;

// ── debounce hook ─────────────────────────────────────────────────────────────
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── helpers ───────────────────────────────────────────────────────────────────
const formatMs = (ms) => {
  if (!ms || ms <= 0) return "0h 0m 0s";
  const dur = moment.duration(ms);
  const days = Math.floor(dur.asDays());
  return [days > 0 && `${days}d`, `${dur.hours()}h`, `${dur.minutes()}m`, `${dur.seconds()}s`]
    .filter(Boolean).join(" ");
};

const getRemainingLabel = (dueDate, status) => {
  if (status === "Completed") return { label: "Completed", type: "completed" };
  const diff = moment(dueDate).diff(moment());
  if (diff < 0) return { label: "Overdue", type: "overdue" };
  const dur = moment.duration(diff);
  return { label: `${dur.days()}d ${dur.hours()}h ${dur.minutes()}m`, type: "pending" };
};

const remainingCls = { completed: "bg-green-100 text-green-700", overdue: "bg-red-100 text-red-700", pending: "bg-blue-100 text-blue-700" };

// ── Sub-components ────────────────────────────────────────────────────────────
const StagePills = ({ stages }) => {
  if (!Array.isArray(stages) || !stages.length) return <span className="text-xs text-gray-400">No stages</span>;
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {stages.map((s, i) => {
        const name = typeof s === "string" ? s : s.name;
        const done = !!s?.completed;
        return (
          <React.Fragment key={i}>
            <span className={`px-2 py-0.5 text-xs rounded-full border ${done ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
              {done && "✓ "}{name}
            </span>
            {i < stages.length - 1 && <span className="text-gray-300 text-xs">→</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const AssigneeCell = ({ employee }) => {
  if (!employee) return <span className="text-xs text-gray-400">Unassigned</span>;
  return (
    <div className="flex items-center gap-1.5">
      {employee.profile_pic
        ? <img src={employee.profile_pic} alt={employee.full_name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
        : <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{employee.full_name?.charAt(0).toUpperCase()}</div>
      }
      <span className="text-xs text-gray-700">{employee.full_name}</span>
    </div>
  );
};

// Custom date range modal (pure Tailwind)
const DateRangeModal = ({ show, customDates, setCustomDates, onApply, onCancel }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Select Custom Date Range</h3>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input type="date" value={customDates.from}
              onChange={(e) => setCustomDates((p) => ({ ...p, from: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input type="date" value={customDates.to}
              onChange={(e) => setCustomDates((p) => ({ ...p, to: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={onApply} disabled={!customDates.from && !customDates.to}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">Apply</button>
        </div>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const TimeTrackingDashboard = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [empMap, setEmpMap] = useState({});
  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState({ totalProjects: 0, totalSubtasks: 0, totalTimeMs: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [openProject, setOpenProject] = useState(null);

  const [projectSearch, setProjectSearch] = useState("");
  const [subtaskSearch, setSubtaskSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedRange, setSelectedRange] = useState("all");
  const [customDates, setCustomDates] = useState({ from: "", to: "" });
  const [showCustomModal, setShowCustomModal] = useState(false);

  const debouncedProjectSearch = useDebounce(projectSearch);
  const debouncedSubtaskSearch = useDebounce(subtaskSearch);

  useEffect(() => {
    axios.get(`${API}/api/employee/get-all`).then((res) => {
      setEmployees(res.data);
      const map = {};
      res.data.forEach((e) => { map[e._id] = e; });
      setEmpMap(map);
    }).catch(console.error);
  }, []);

  const fetchData = useCallback(async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit, range: selectedRange,
        ...(debouncedProjectSearch && { search: debouncedProjectSearch }),
        ...(debouncedSubtaskSearch && { subtaskSearch: debouncedSubtaskSearch }),
        ...(selectedEmployee && { employee: selectedEmployee }),
        ...(selectedRange === "custom" && customDates.from && { from: customDates.from }),
        ...(selectedRange === "custom" && customDates.to && { to: customDates.to }),
      });
      const { data } = await axios.get(`${API}/api/time-tracking?${params}`);
      setProjects(data.projects);
      setSummary(data.summary);
      setPagination({ ...data.pagination, limit });
      setOpenProject(null);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [debouncedProjectSearch, debouncedSubtaskSearch, selectedEmployee, selectedRange, customDates]); // eslint-disable-line

  useEffect(() => { fetchData(1, pagination.limit); }, [debouncedProjectSearch, debouncedSubtaskSearch, selectedEmployee, selectedRange, customDates]); // eslint-disable-line

  const handleReset = () => {
    setProjectSearch(""); setSubtaskSearch(""); setSelectedEmployee(""); setSelectedRange("all"); setCustomDates({ from: "", to: "" });
  };

  const rangeLabels = [
    { key: "all", label: "All Time" },
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "custom", label: "Custom" },
  ];

  if (loading && !projects.length) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 space-y-4">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-semibold text-gray-800">Subtasks Time Tracking</h1>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Track time spent by your team across tasks and projects</p>
          </div>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Projects", value: summary.totalProjects },
          { label: "Subtasks with logs", value: summary.totalSubtasks },
          { label: "Total Time Tracked", value: formatMs(summary.totalTimeMs) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-5 text-center">
            <p className="text-base sm:text-2xl font-bold text-gray-800 leading-tight">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
        {/* Search row */}
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <input type="text" placeholder="🔍 Search project name…" value={projectSearch}
            onChange={(e) => setProjectSearch(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          <input type="text" placeholder="🔍 Search subtask name…" value={subtaskSearch}
            onChange={(e) => setSubtaskSearch(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500">
            <option value="">All Employees</option>
            {employees.map((e) => <option key={e._id} value={e._id}>{e.full_name}</option>)}
          </select>
          <button onClick={handleReset}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" />
            </svg>
            Reset
          </button>
        </div>

        {/* Time range pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-500 flex-shrink-0">Time Range:</span>
          <div className="flex gap-2 flex-wrap">
            {rangeLabels.map(({ key, label }) => (
              <button key={key}
                onClick={() => key === "custom" ? setShowCustomModal(true) : setSelectedRange(key)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors whitespace-nowrap ${selectedRange === key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                  }`}>
                {label}
                {key === "custom" && customDates.from && (
                  <span className="ml-1 opacity-75">({customDates.from}→{customDates.to || "…"})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-2">
          Showing {projects.length} of {pagination.total} projects
          {loading && <span className="ml-2 text-blue-500 animate-pulse">Updating…</span>}
        </p>
      </div>

      {/* ── Projects list ── */}
      <div className="space-y-2">
        {projects.length === 0 && !loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-sm text-gray-400">
            No time-tracked projects found for the selected filters.
          </div>
        )}

        {projects.map((project) => (
          <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Project header — clickable accordion */}
            <button
              className="w-full flex items-center gap-3 px-4 py-3 sm:py-4 text-left hover:bg-gray-50 transition-colors"
              onClick={() => setOpenProject((p) => p === project._id ? null : project._id)}>
              <div className="flex-1 flex items-center justify-between gap-3 sm:flex-row flex-col">
                <div className="flex items-center gap-3">
                  {/* Chevron */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${openProject === project._id ? "rotate-180" : ""}`}>
                    <path d="m6 9 6 6 6-6" />
                  </svg>

                  {/* Name + status */}
                  <div className="flex-1 min-w-0 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm sm:text-base text-gray-800 truncate">{project.project_name}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${project.status === "Completed" ? "bg-green-100 text-green-700"
                      : project.status === "In Progress" ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                      }`}>{project.status}</span>
                  </div>
                </div>
                {/* Meta */}
                <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500 flex-shrink-0">
                  <span className="w-[80px] text-left"> Total: <strong className="text-gray-700">{project.subtaskCount}</strong></span>
                  <span className="w-[160px] text-left">⏱ <strong className="text-gray-700">{formatMs(project.totalTimeMs)}</strong></span>
                </div>
              </div>
            </button>

            {/* Expanded subtasks */}
            {openProject === project._id && (
              <div className="border-t border-gray-100">
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Subtask Name", "Stages", "Due Date", "Remaining", "Time Spent", "Assigned To"].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {project.subtasks.map((subtask) => {
                        const emp = empMap[subtask.assign_to?.toString()];
                        const { label, type } = getRemainingLabel(subtask.due_date, subtask.status);
                        return (
                          <tr key={subtask._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <span className="block max-w-[200px] truncate text-gray-800 font-medium" title={subtask.task_name}>{subtask.task_name}</span>
                            </td>
                            <td className="px-4 py-3"><StagePills stages={subtask.stages} /></td>
                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                              {subtask.due_date ? moment(subtask.due_date).format("DD MMM YYYY") : "—"}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${remainingCls[type]}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />{label}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">{formatMs(subtask.timeSpentMs)}</td>
                            <td className="px-4 py-3"><AssigneeCell employee={emp} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile subtask cards */}
                <div className="md:hidden p-3 space-y-2">
                  {project.subtasks.map((subtask) => {
                    const emp = empMap[subtask.assign_to?.toString()];
                    const { label, type } = getRemainingLabel(subtask.due_date, subtask.status);
                    return (
                      <div key={subtask._id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2">
                        <p className="font-medium text-sm text-gray-800">{subtask.task_name}</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="text-gray-500">
                            📅 {subtask.due_date ? moment(subtask.due_date).format("DD MMM YYYY") : "—"}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${remainingCls[type]}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />{label}
                          </span>
                          <span className="font-mono text-gray-600">⏱ {formatMs(subtask.timeSpentMs)}</span>
                        </div>
                        <StagePills stages={subtask.stages} />
                        <AssigneeCell employee={emp} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Pagination ── */}
      {(pagination.totalPages > 1 || pagination.limit !== 15) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500 order-2 sm:order-1">
              {projects.length} of {pagination.total} projects
            </p>
            <div className="flex gap-1.5 items-center order-1 sm:order-2 flex-wrap justify-center">
              <button onClick={() => fetchData(pagination.page - 1, pagination.limit)} disabled={pagination.page <= 1 || loading}
                className="px-3 py-1.5 text-xs rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors">‹ Prev</button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 2)
                .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("…"); acc.push(p); return acc; }, [])
                .map((p, i) => p === "…"
                  ? <span key={`e${i}`} className="px-2 text-xs text-gray-400">…</span>
                  : <button key={p} onClick={() => fetchData(p, pagination.limit)} disabled={loading}
                    className={`w-8 h-7 text-xs rounded-lg border transition-colors ${p === pagination.page ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50 border-gray-200"}`}>
                    {p}
                  </button>
                )}

              <button onClick={() => fetchData(pagination.page + 1, pagination.limit)} disabled={pagination.page >= pagination.totalPages || loading}
                className="px-3 py-1.5 text-xs rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors">Next ›</button>

              <select value={pagination.limit} onChange={(e) => fetchData(1, Number(e.target.value))}
                className="ml-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500">
                {[10, 15, 25, 50].map((n) => <option key={n} value={n}>{n}/page</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom date modal ── */}
      <DateRangeModal
        show={showCustomModal}
        customDates={customDates}
        setCustomDates={setCustomDates}
        onApply={() => { setSelectedRange("custom"); setShowCustomModal(false); }}
        onCancel={() => setShowCustomModal(false)}
      />
    </div>
  );
};

export default TimeTrackingDashboard;