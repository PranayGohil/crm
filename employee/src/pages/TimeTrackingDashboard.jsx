// TimeTrackingDashboard.jsx  (Manager — team time tracking, client-side filtering)
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import LoadingOverlay from "../components/LoadingOverlay";

const PROJECTS_PER_PAGE_OPTIONS = [5, 10, 20, 50];
const DEFAULT_PAGE_SIZE = 10;

// ── Shared sub-components ─────────────────────────────────────────────────────

const StagePills = ({ stages }) => {
  if (!Array.isArray(stages) || !stages.length)
    return <span className="text-xs text-gray-400">No stages</span>;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {stages.map((stg, i) => {
        const name = typeof stg === "string" ? stg : stg.name;
        const done = !!stg?.completed;
        return (
          <React.Fragment key={i}>
            <span className={`px-2 py-0.5 text-xs rounded-full border ${done ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"
              }`}>
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
        : <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          {employee.full_name?.charAt(0).toUpperCase() || "?"}
        </div>
      }
      <span className="text-xs text-gray-700 truncate">{employee.full_name}</span>
    </div>
  );
};

const remainingCls = {
  Completed: "bg-green-100 text-green-700",
  Overdue: "bg-red-100 text-red-700",
  pending: "bg-blue-100 text-blue-700",
};

const CustomDateModal = ({ show, onHide, customDateRange, setCustomDateRange, onApply }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Select Custom Date Range</h3>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input type="date" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setCustomDateRange((p) => ({ ...p, from: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input type="date" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setCustomDateRange((p) => ({ ...p, to: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onHide} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={() => { onApply(); onHide(); }} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Apply</button>
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const TimeTrackingDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("employeeUser"));

  const [projects, setProjects] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [openTable, setOpenTable] = useState(null);

  const [selectedFilter, setSelectedFilter] = useState("All Time");
  const [customDateRange, setCustomDateRange] = useState({ from: null, to: null });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("All");
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // ── fetch ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projRes, subRes, empRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/project/get-all-archived`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/subtask/get-all`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/employee/get-all`),
        ]);
        const myEmployees = empRes.data.filter((emp) => emp.reporting_manager?._id === user._id);
        const myEmployeeIds = myEmployees.map((emp) => emp._id);
        const mySubtasks = subRes.data.filter((s) =>
          myEmployeeIds.includes(s.assign_to || s.time_logs.some((log) => myEmployeeIds.includes(log.user_id)))
        );
        const myProjects = projRes.data.filter((proj) => mySubtasks.some((s) => s.project_id === proj._id));
        setProjects(myProjects); setSubtasks(mySubtasks); setEmployees(myEmployees);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []); // eslint-disable-line

  // ── helpers ────────────────────────────────────────────────────────────
  const handleToggle = (id) => setOpenTable((p) => p === id ? null : id);

  const isWithinFilter = (dateStr) => {
    const date = moment(dateStr), now = moment();
    switch (selectedFilter) {
      case "Today": return date.isSame(now, "day");
      case "This Week": return date.isSame(now, "week");
      case "This Month": return date.isSame(now, "month");
      case "Custom":
        if (customDateRange.from && customDateRange.to)
          return date.isBetween(moment(customDateRange.from), moment(customDateRange.to).endOf("day"), null, "[]");
        return false;
      default: return true;
    }
  };

  const calculateTimeSpent = (timeLogs) => {
    let total = 0;
    timeLogs?.forEach((log) => {
      if (log.start_time && log.end_time && isWithinFilter(log.start_time))
        total += moment(log.end_time).diff(moment(log.start_time), "seconds");
    });
    return moment.utc(moment.duration(total, "seconds").asMilliseconds()).format("HH:mm:ss");
  };

  const calculateRemainingTime = (dueDate, status) => {
    if (status === "Completed") return "Completed";
    const diff = moment(dueDate).diff(moment());
    const dur = moment.duration(diff);
    return dur.asMilliseconds() < 0 ? "Overdue" : `${dur.days()}d ${dur.hours()}h ${dur.minutes()}m`;
  };

  const getEmployeeById = (id) => employees.find((e) => e._id === id);

  // ── derived data ───────────────────────────────────────────────────────
  const filteredSubtasks = useMemo(() =>
    subtasks.filter((s) =>
      (selectedEmployeeId === "All" || s.assign_to === selectedEmployeeId) &&
      s.time_logs?.some((log) => log.start_time && log.end_time ? isWithinFilter(log.start_time) : false)
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [subtasks, selectedEmployeeId, selectedFilter, customDateRange]
  );

  const visibleProjects = useMemo(() => {
    const q = projectSearch.trim().toLowerCase();
    return projects.filter((proj) =>
      filteredSubtasks.some((s) => s.project_id === proj._id) &&
      (!q || proj.project_name?.toLowerCase().includes(q))
    );
  }, [projects, filteredSubtasks, projectSearch]);

  const totalPages = Math.max(1, Math.ceil(visibleProjects.length / pageSize));

  useEffect(() => { setCurrentPage(1); setOpenTable(null); },
    [selectedFilter, customDateRange, selectedEmployeeId, projectSearch, pageSize]);

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return visibleProjects.slice(start, start + pageSize);
  }, [visibleProjects, currentPage, pageSize]);

  const summaryData = useMemo(() => {
    const mainTasks = new Set(filteredSubtasks.map((s) => s.project_id)).size;
    const totalTimeTracked = filteredSubtasks.reduce((acc, sub) => {
      return acc + (sub.time_logs?.reduce((t, log) => {
        if (log.start_time && log.end_time && isWithinFilter(log.start_time))
          return t + moment(log.end_time).diff(moment(log.start_time), "seconds");
        return t;
      }, 0) ?? 0);
    }, 0);
    return { mainTasks, subtasks: filteredSubtasks.length, totalTimeTracked };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredSubtasks, selectedFilter, customDateRange]);

  const totalTimeFormatted = moment.utc(summaryData.totalTimeTracked * 1000).format("HH:mm:ss");

  if (loading) return <LoadingOverlay />;

  const rangeFilters = ["All Time", "Today", "This Week", "This Month", "Custom"];

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
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-5">
          <p className="text-xl sm:text-3xl font-bold text-gray-800">{summaryData.mainTasks}</p>
          <p className="text-xs text-gray-500 mt-0.5">Main Tasks <span className="text-gray-400">({summaryData.subtasks} subtasks)</span></p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-5">
          <p className="text-xl sm:text-3xl font-bold text-gray-800 font-mono">{totalTimeFormatted}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Time Tracked</p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 space-y-3">
        {/* Time range pills */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Time Range</p>
          <div className="flex flex-wrap gap-2">
            {rangeFilters.map((label) => (
              <button key={label}
                onClick={() => label === "Custom" ? setShowCustomDateModal(true) : setSelectedFilter(label)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors whitespace-nowrap ${selectedFilter === label ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}>
                {label}
                {label === "Custom" && selectedFilter === "Custom" && customDateRange.from && (
                  <span className="ml-1 opacity-75 text-xs">({customDateRange.from}→{customDateRange.to || "…"})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Employee filter + search row */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500">
            <option value="All">All Employees</option>
            {employees.map((emp) => <option key={emp._id} value={emp._id}>{emp.full_name}</option>)}
          </select>

          <div className="relative flex-1">
            <input type="text" placeholder="🔍 Search project name…" value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            {projectSearch && (
              <button onClick={() => setProjectSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Showing <strong className="text-gray-600">{Math.min((currentPage - 1) * pageSize + 1, visibleProjects.length)}–{Math.min(currentPage * pageSize, visibleProjects.length)}</strong> of <strong className="text-gray-600">{visibleProjects.length}</strong> projects
        </p>
      </div>

      {/* ── Projects list ── */}
      <div className="space-y-2">
        {visibleProjects.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-200 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <p className="text-sm text-gray-400">No projects found for the selected filters.</p>
          </div>
        ) : paginatedProjects.map((project) => {
          const projectSubtasks = filteredSubtasks.filter((s) => s.project_id === project._id);
          const totalSec = projectSubtasks.reduce((acc, sub) =>
            acc + moment.duration(calculateTimeSpent(sub.time_logs)).asSeconds(), 0);
          const dur = moment.duration(totalSec, "seconds");
          const formattedTime = `${dur.days()}d ${dur.hours()}h ${dur.minutes()}m ${dur.seconds()}s`;
          const isOpen = openTable === project._id;

          return (
            <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Accordion header */}
              <button className="w-full flex items-center gap-3 px-4 py-3 sm:py-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => handleToggle(project._id)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
                <span className="flex-1 font-semibold text-sm sm:text-base text-gray-800 text-left truncate min-w-0">{project.project_name}</span>
                <span className="flex-shrink-0 font-mono text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{formattedTime}</span>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="border-t border-gray-100">
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {["Subtask Name", "Stage", "Due Date", "Remaining Time", "Time Spent", "Assigned Employee"].map((h) => (
                            <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {projectSubtasks.map((subtask, idx) => {
                          const employee = getEmployeeById(subtask.assign_to);
                          const spent = calculateTimeSpent(subtask.time_logs);
                          const remaining = calculateRemainingTime(subtask.due_date, subtask.status);
                          const remType = remaining === "Completed" ? "Completed" : remaining === "Overdue" ? "Overdue" : "pending";
                          return (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3">
                                <span className="block max-w-[180px] truncate font-medium text-gray-800" title={subtask.task_name}>{subtask.task_name}</span>
                              </td>
                              <td className="px-4 py-3"><StagePills stages={subtask.stages} /></td>
                              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">{moment(subtask.due_date).format("DD MMM YYYY")}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${remainingCls[remType]}`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />{remaining}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">{spent}</td>
                              <td className="px-4 py-3"><AssigneeCell employee={employee} /></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden p-3 space-y-2">
                    {projectSubtasks.map((subtask, idx) => {
                      const employee = getEmployeeById(subtask.assign_to);
                      const spent = calculateTimeSpent(subtask.time_logs);
                      const remaining = calculateRemainingTime(subtask.due_date, subtask.status);
                      const remType = remaining === "Completed" ? "Completed" : remaining === "Overdue" ? "Overdue" : "pending";
                      return (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2">
                          <p className="font-semibold text-sm text-gray-800">{subtask.task_name}</p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="text-gray-500">📅 {moment(subtask.due_date).format("DD MMM YYYY")}</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${remainingCls[remType]}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />{remaining}
                            </span>
                            <span className="font-mono text-gray-600">⏱ {spent}</span>
                          </div>
                          <StagePills stages={subtask.stages} />
                          <AssigneeCell employee={employee} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Pagination ── */}
      {(totalPages > 1 || pageSize !== DEFAULT_PAGE_SIZE) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500 order-2 sm:order-1">
              {summaryData.mainTasks} main tasks · {summaryData.subtasks} subtasks · {totalTimeFormatted} total
            </p>
            <div className="flex gap-1.5 items-center order-1 sm:order-2 flex-wrap justify-center">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors">‹ Prev</button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("…"); acc.push(p); return acc; }, [])
                .map((p, i) => p === "…"
                  ? <span key={`e${i}`} className="px-2 text-xs text-gray-400">…</span>
                  : <button key={p} onClick={() => setCurrentPage(p)}
                    className={`w-8 h-7 text-xs rounded-lg border transition-colors ${p === currentPage ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50 border-gray-200"}`}>
                    {p}
                  </button>
                )}

              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors">Next ›</button>

              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}
                className="ml-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500">
                {PROJECTS_PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n} projects</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom date modal ── */}
      <CustomDateModal
        show={showCustomDateModal}
        onHide={() => setShowCustomDateModal(false)}
        customDateRange={customDateRange}
        setCustomDateRange={setCustomDateRange}
        onApply={() => setSelectedFilter("Custom")}
      />
    </div>
  );
};

export default TimeTrackingDashboard;