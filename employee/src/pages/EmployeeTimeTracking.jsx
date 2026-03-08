// EmployeeTimeTracking.jsx  (employee's OWN time tracking — server-side pagination)
// ManagerTimeTracking exported as named export at bottom
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import LoadingOverlay from "../components/LoadingOverlay";
import {
  formatMs,
  getRemainingLabel,
  StagePills,
  RANGE_OPTIONS,
  useDebounce,
} from "../hooks/useEmployeeData";

const API = process.env.REACT_APP_API_URL;

// ── Shared UI ─────────────────────────────────────────────────────────────────

const remainingCls = {
  completed: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  pending: "bg-blue-100 text-blue-700",
};

const AssigneeCell = ({ emp }) => {
  if (!emp) return <span className="text-xs text-gray-400">Unassigned</span>;
  return (
    <div className="flex items-center gap-1.5">
      {emp.profile_pic
        ? <img src={emp.profile_pic} alt={emp.full_name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
        : <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          {emp.full_name?.charAt(0).toUpperCase()}
        </div>
      }
      <span className="text-xs text-gray-700 truncate">{emp.full_name}</span>
    </div>
  );
};

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
          <button onClick={onHide} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={() => { onApply(); onHide(); }} disabled={!dates.from && !dates.to}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">Apply</button>
        </div>
      </div>
    </div>
  );
};

const PaginationBar = ({ pagination, onPageChange, onLimitChange, loading }) => {
  const { page, totalPages, limit } = pagination;
  if (totalPages <= 1 && limit === 20) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
    .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("..."); acc.push(p); return acc; }, []);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mt-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-500 order-2 sm:order-1">Page {page} of {totalPages}</p>
        <div className="flex gap-1.5 items-center order-1 sm:order-2 flex-wrap justify-center">
          <button onClick={() => onPageChange(page - 1)} disabled={page <= 1 || loading}
            className="px-3 py-1.5 text-xs rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors">Prev</button>
          {pages.map((p, i) => p === "..."
            ? <span key={"e" + i} className="px-2 text-xs text-gray-400">...</span>
            : <button key={p} onClick={() => onPageChange(p)} disabled={loading}
              className={"w-8 h-7 text-xs rounded-lg border transition-colors " + (p === page ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50 border-gray-200")}>
              {p}
            </button>
          )}
          <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages || loading}
            className="px-3 py-1.5 text-xs rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors">Next</button>
          <select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}
            className="ml-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white">
            {[10, 20, 25, 50].map((n) => <option key={n} value={n}>{n}/page</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

// Reusable accordion — renders desktop table + mobile cards
const ProjectAccordion = ({ project, openTable, setOpenTable, headers, renderRow, renderCard }) => {
  const isOpen = openTable === project._id;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button className="w-full flex items-center gap-3 px-4 py-3 sm:py-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpenTable((p) => p === project._id ? null : project._id)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={"flex-shrink-0 text-gray-400 transition-transform duration-200 " + (isOpen ? "rotate-180" : "")}>
          <path d="m6 9 6 6 6-6" />
        </svg>
        <span className="flex-1 font-semibold text-sm sm:text-base text-gray-800 truncate min-w-0">{project.project_name}</span>
        <div className="flex-shrink-0 flex items-center gap-2 text-xs text-gray-500">
          {project.subtaskCount != null && (
            <span className="hidden sm:inline bg-gray-100 px-2 py-0.5 rounded-full">
              {project.subtaskCount} tasks
            </span>
          )}
          <span className="font-mono bg-gray-100 px-2 py-1 rounded-lg">{formatMs(project.totalTimeMs)}</span>
        </div>
      </button>
      {isOpen && (
        <div className="border-t border-gray-100">
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>{headers.map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {project.subtasks.map((s) => <tr key={s._id} className="hover:bg-gray-50">{renderRow(s)}</tr>)}
              </tbody>
            </table>
          </div>
          <div className="md:hidden p-3 space-y-2">
            {project.subtasks.map((s) => (
              <div key={s._id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2">{renderCard(s)}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── EmployeeTimeTracking ──────────────────────────────────────────────────────
const EmployeeTimeTracking = () => {
  const navigate = useNavigate();
  const employeeId = JSON.parse(localStorage.getItem("employeeUser") ?? "{}")?._id;

  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState({ totalProjects: 0, totalSubtasks: 0, totalTimeMs: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [openTable, setOpenTable] = useState(null);
  const [selectedRange, setSelectedRange] = useState("today");
  const [customDates, setCustomDates] = useState({ from: "", to: "" });
  const [showCustomModal, setShowCustomModal] = useState(false);

  const fetchData = useCallback(async (page = 1, limit = pagination.limit) => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit, range: selectedRange,
        ...(selectedRange === "custom" && customDates.from && { from: customDates.from }),
        ...(selectedRange === "custom" && customDates.to && { to: customDates.to }),
      });
      const { data } = await axios.get(API + "/api/employee/time-tracking/" + employeeId + "?" + params);
      setProjects(data.projects); setSummary(data.summary);
      setPagination({ ...data.pagination, limit }); setOpenTable(null);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [employeeId, selectedRange, customDates]); // eslint-disable-line

  useEffect(() => { fetchData(1, pagination.limit); }, [selectedRange, customDates]); // eslint-disable-line

  const renderRow = (s) => {
    const { label, type } = getRemainingLabel(s.due_date, s.status);
    return (<>
      <td className="px-4 py-3"><span className="block max-w-[180px] truncate font-medium text-gray-800">{s.task_name}</span></td>
      <td className="px-4 py-3"><StagePills stages={s.stages} /></td>
      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">{s.due_date ? moment(s.due_date).format("DD MMM YYYY") : "—"}</td>
      <td className="px-4 py-3">
        <span className={"inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full " + remainingCls[type]}>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />{label}
        </span>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">{formatMs(s.timeSpentMs)}</td>
    </>);
  };

  const renderCard = (s) => {
    const { label, type } = getRemainingLabel(s.due_date, s.status);
    return (<>
      <p className="font-semibold text-sm text-gray-800">{s.task_name}</p>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="text-gray-500">📅 {s.due_date ? moment(s.due_date).format("DD MMM YYYY") : "—"}</span>
        <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-full " + remainingCls[type]}>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />{label}
        </span>
        <span className="font-mono text-gray-600">⏱ {formatMs(s.timeSpentMs)}</span>
      </div>
      <StagePills stages={s.stages} />
    </>);
  };

  if (loading && !projects.length) return <LoadingOverlay />;

  const empRangeOptions = RANGE_OPTIONS ?? [
    { key: "today", label: "Today" }, { key: "week", label: "This Week" },
    { key: "month", label: "This Month" }, { key: "all", label: "All Time" }, { key: "custom", label: "Custom" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-semibold text-gray-800">My Time Tracking</h1>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Track your time spent on tasks and projects</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-5">
          <p className="text-xl sm:text-3xl font-bold text-gray-800">{summary.totalProjects}</p>
          <p className="text-xs text-gray-500 mt-0.5">Projects <span className="text-gray-400">({summary.totalSubtasks} subtasks)</span></p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-5">
          <p className="text-xl sm:text-3xl font-bold text-gray-800 font-mono">{formatMs(summary.totalTimeMs)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Time Tracked</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Time Range</p>
        <div className="flex flex-wrap gap-2">
          {empRangeOptions.map(({ key, label }) => (
            <button key={key} onClick={() => key === "custom" ? setShowCustomModal(true) : setSelectedRange(key)}
              className={"px-3 py-1 text-xs rounded-full border transition-colors whitespace-nowrap " + (selectedRange === key ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400")}>
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {projects.length} of {pagination.total} projects
          {loading && <span className="ml-2 text-blue-500 animate-pulse">Updating…</span>}
        </p>
      </div>

      <div className="space-y-2">
        {projects.length === 0 && !loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-sm text-gray-400">
            No time-tracked tasks found for the selected period.
          </div>
        )}
        {projects.map((project) => (
          <ProjectAccordion key={project._id} project={project}
            openTable={openTable} setOpenTable={setOpenTable}
            headers={["Subtask Name", "Stages", "Due Date", "Remaining", "Time Spent"]}
            renderRow={renderRow} renderCard={renderCard} />
        ))}
      </div>

      <PaginationBar pagination={pagination} onPageChange={(p) => fetchData(p, pagination.limit)}
        onLimitChange={(l) => fetchData(1, l)} loading={loading} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row justify-between gap-2">
        <p className="text-xs text-gray-600">
          <span className="font-semibold text-gray-800">{summary.totalProjects}</span> projects ·{" "}
          <span className="font-semibold text-gray-800">{summary.totalSubtasks}</span> subtasks
        </p>
        <p className="text-xs text-gray-600">
          Total time: <span className="font-semibold font-mono text-gray-800">{formatMs(summary.totalTimeMs)}</span>
        </p>
      </div>

      <CustomDateModal show={showCustomModal} onHide={() => setShowCustomModal(false)}
        dates={customDates} onDatesChange={setCustomDates} onApply={() => setSelectedRange("custom")} />
    </div>
  );
};

export default EmployeeTimeTracking;

// ── ManagerTimeTracking ───────────────────────────────────────────────────────
export const ManagerTimeTracking = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("employeeUser") ?? "{}");
  const managerId = user?._id;

  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState({ totalProjects: 0, totalSubtasks: 0, totalTimeMs: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [openTable, setOpenTable] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [empMap, setEmpMap] = useState({});
  const [selectedRange, setSelectedRange] = useState("all");
  const [customDates, setCustomDates] = useState({ from: "", to: "" });
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [projectSearch, setProjectSearch] = useState("");

  useEffect(() => {
    axios.get(API + "/api/employee/get-all").then((res) => {
      const team = res.data.filter((e) => e.reporting_manager?._id === managerId);
      setEmployees(team);
      const map = {}; team.forEach((e) => { map[e._id] = e; });
      setEmpMap(map);
    }).catch(console.error);
  }, [managerId]);

  const fetchData = useCallback(async (page = 1, limit = pagination.limit) => {
    if (!managerId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit, range: selectedRange,
        ...(projectSearch && { search: projectSearch }),
        ...(selectedEmployee && { employee: selectedEmployee }),
        ...(selectedRange === "custom" && customDates.from && { from: customDates.from }),
        ...(selectedRange === "custom" && customDates.to && { to: customDates.to }),
      });
      const { data } = await axios.get(API + "/api/time-tracking?" + params);
      setProjects(data.projects); setSummary(data.summary);
      setPagination({ ...data.pagination, limit }); setOpenTable(null);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [managerId, selectedRange, customDates, selectedEmployee, projectSearch]); // eslint-disable-line

  const debouncedSearch = useDebounce(projectSearch);
  useEffect(() => { fetchData(1, pagination.limit); }, [selectedRange, customDates, selectedEmployee, debouncedSearch]); // eslint-disable-line

  const renderRow = (s) => {
    const emp = empMap[s.assign_to?.toString()];
    const { label, type } = getRemainingLabel(s.due_date, s.status);
    return (<>
      <td className="px-4 py-3"><span className="block max-w-[160px] truncate font-medium text-gray-800">{s.task_name}</span></td>
      <td className="px-4 py-3"><StagePills stages={s.stages} /></td>
      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">{s.due_date ? moment(s.due_date).format("DD MMM YYYY") : "—"}</td>
      <td className="px-4 py-3">
        <span className={"inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full " + remainingCls[type]}>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />{label}
        </span>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">{formatMs(s.timeSpentMs)}</td>
      <td className="px-4 py-3"><AssigneeCell emp={emp} /></td>
    </>);
  };

  const renderCard = (s) => {
    const emp = empMap[s.assign_to?.toString()];
    const { label, type } = getRemainingLabel(s.due_date, s.status);
    return (<>
      <p className="font-semibold text-sm text-gray-800">{s.task_name}</p>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="text-gray-500">📅 {s.due_date ? moment(s.due_date).format("DD MMM YYYY") : "—"}</span>
        <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-full " + remainingCls[type]}>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />{label}
        </span>
        <span className="font-mono text-gray-600">⏱ {formatMs(s.timeSpentMs)}</span>
      </div>
      <StagePills stages={s.stages} />
      <AssigneeCell emp={emp} />
    </>);
  };

  if (loading && !projects.length) return <LoadingOverlay />;

  const mgrRangeOptions = RANGE_OPTIONS ?? [
    { key: "all", label: "All Time" }, { key: "today", label: "Today" },
    { key: "week", label: "This Week" }, { key: "month", label: "This Month" }, { key: "custom", label: "Custom" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-semibold text-gray-800">Team Time Tracking</h1>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Track time spent by your team across tasks and projects</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-5">
          <p className="text-xl sm:text-3xl font-bold text-gray-800">{summary.totalProjects}</p>
          <p className="text-xs text-gray-500 mt-0.5">Projects <span className="text-gray-400">({summary.totalSubtasks} subtasks)</span></p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-5">
          <p className="text-xl sm:text-3xl font-bold text-gray-800 font-mono">{formatMs(summary.totalTimeMs)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Time Tracked</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input type="text" placeholder="Search project..." value={projectSearch}
            onChange={(e) => setProjectSearch(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}
            className="flex-1 sm:max-w-xs px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500">
            <option value="">All Team Members</option>
            {employees.map((e) => <option key={e._id} value={e._id}>{e.full_name}</option>)}
          </select>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Time Range</p>
          <div className="flex flex-wrap gap-2">
            {mgrRangeOptions.map(({ key, label }) => (
              <button key={key} onClick={() => key === "custom" ? setShowCustomModal(true) : setSelectedRange(key)}
                className={"px-3 py-1 text-xs rounded-full border transition-colors whitespace-nowrap " + (selectedRange === key ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400")}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-400">
          {projects.length} of {pagination.total} projects
          {loading && <span className="ml-2 text-blue-500 animate-pulse">Updating...</span>}
        </p>
      </div>

      <div className="space-y-2">
        {projects.length === 0 && !loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-sm text-gray-400">No time-tracked projects found.</div>
        )}
        {projects.map((project) => (
          <ProjectAccordion key={project._id} project={project}
            openTable={openTable} setOpenTable={setOpenTable}
            headers={["Subtask Name", "Stages", "Due Date", "Remaining", "Time Spent", "Assigned To"]}
            renderRow={renderRow} renderCard={renderCard} />
        ))}
      </div>

      <PaginationBar pagination={pagination} onPageChange={(p) => fetchData(p, pagination.limit)}
        onLimitChange={(l) => fetchData(1, l)} loading={loading} />

      <CustomDateModal show={showCustomModal} onHide={() => setShowCustomModal(false)}
        dates={customDates} onDatesChange={setCustomDates} onApply={() => setSelectedRange("custom")} />
    </div>
  );
};