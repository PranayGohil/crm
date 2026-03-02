// EmployeeTimeTracking.optimized.jsx  (employee's OWN time tracking)
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import LoadingOverlay from "../components/LoadingOverlay";
import { formatMs, getRemainingLabel, StagePills, RANGE_OPTIONS, PaginationBar, CustomDateModal } from "../hooks/useEmployeeData";
import { useDebounce } from "../hooks/useEmployeeData";

const API = process.env.REACT_APP_API_URL;

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
        page, limit,
        range: selectedRange,
        ...(selectedRange === "custom" && customDates.from && { from: customDates.from }),
        ...(selectedRange === "custom" && customDates.to && { to: customDates.to }),
      });
      const { data } = await axios.get(`${API}/api/employee/time-tracking/${employeeId}?${params}`);
      setProjects(data.projects);
      setSummary(data.summary);
      setPagination({ ...data.pagination, limit });
      setOpenTable(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, selectedRange, customDates]);

  useEffect(() => { fetchData(1, pagination.limit); }, [selectedRange, customDates]);

  if (loading && !projects.length) return <LoadingOverlay />;

  return (
    <div className="dashboard-container">
      <section className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-button" onClick={() => navigate(-1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <h1 className="header-title">My Time Tracking</h1>
          </div>
          <p className="project-name">Track your time spent on tasks and projects</p>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-info">
          <span className="stats-number">{summary.totalProjects}</span>
          <span>Projects ({summary.totalSubtasks} subtasks)</span>
        </div>
        <div className="stats-info">
          <span className="stats-number">{formatMs(summary.totalTimeMs)}</span>
          <span>Total Time Tracked</span>
        </div>
      </section>

      <section className="table-container">
        {/* Filters */}
        <div className="table-controls mb-4">
          <div className="filter-group">
            <span className="filter-label">Time Range:</span>
            <div className="filter-options">
              {RANGE_OPTIONS.map(({ key, label }) => (
                <button key={key}
                  className={`filter-btn ${selectedRange === key ? "active" : ""}`}
                  onClick={() => key === "custom" ? setShowCustomModal(true) : setSelectedRange(key)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Showing {projects.length} of {pagination.total} projects
            {loading && <span className="ml-2 text-blue-500">↻ Updating…</span>}
          </p>
        </div>

        {/* Projects */}
        <div className="projects-list">
          {projects.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400">No time-tracked tasks found for the selected period.</div>
          )}
          {projects.map((project) => (
            <div key={project._id} className="project-item">
              <div
                className={`project-header ${openTable === project._id ? "open" : ""}`}
                onClick={() => setOpenTable((p) => p === project._id ? null : project._id)}
              >
                <div className="project-name">{project.project_name}</div>
                <div className="project-time">{formatMs(project.totalTimeMs)}</div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transform: openTable === project._id ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>

              {openTable === project._id && (
                <div className="subtasks-table-container">
                  <table className="data-table">
                    <thead>
                      <tr><th>Subtask Name</th><th>Stages</th><th>Due Date</th><th>Remaining</th><th>Time Spent</th></tr>
                    </thead>
                    <tbody>
                      {project.subtasks.map((subtask) => {
                        const { label, type } = getRemainingLabel(subtask.due_date, subtask.status);
                        return (
                          <tr key={subtask._id}>
                            <td><span className="task-name-text" title={subtask.task_name}>{subtask.task_name}</span></td>
                            <td><StagePills stages={subtask.stages} /></td>
                            <td><span className="date-cell">{subtask.due_date ? moment(subtask.due_date).format("DD MMM YYYY") : "-"}</span></td>
                            <td>
                              <span className={`status-badge status-${type}`}>
                                <span className="status-dot" />{label}
                              </span>
                            </td>
                            <td><span className="time-spent font-mono">{formatMs(subtask.timeSpentMs)}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>

        <PaginationBar
          pagination={pagination}
          onPageChange={(p) => fetchData(p, pagination.limit)}
          onLimitChange={(l) => fetchData(1, l)}
          loading={loading}
        />

        <div className="pagination-container">
          <div className="pagination-info">
            Showing <span className="highlight">{summary.totalProjects}</span> projects
            (<span className="highlight">{summary.totalSubtasks}</span> subtasks)
          </div>
          <div className="pagination-info">
            Total time: <span className="highlight">{formatMs(summary.totalTimeMs)}</span>
          </div>
        </div>
      </section>

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

export default EmployeeTimeTracking;


// ─────────────────────────────────────────────────────────────────────────────
// ManagerTimeTracking.optimized.jsx  (document 12 — manager sees team's time)
// Reuses the same /api/time-tracking endpoint built earlier but scoped to
// the manager's team employees via the existing timeTrackingController.
// ─────────────────────────────────────────────────────────────────────────────
export const ManagerTimeTracking = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("employeeUser") ?? "{}");
  const managerId = user?._id;

  // Same state shape as employee version — just different API call
  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState({ totalProjects: 0, totalSubtasks: 0, totalTimeMs: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [openTable, setOpenTable] = useState(null);

  // reference data
  const [employees, setEmployees] = useState([]);
  const [empMap, setEmpMap] = useState({});

  const [selectedRange, setSelectedRange] = useState("all");
  const [customDates, setCustomDates] = useState({ from: "", to: "" });
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [projectSearch, setProjectSearch] = useState("");

  // Load team employees once
  useEffect(() => {
    axios.get(`${API}/api/employee/get-all`).then((res) => {
      const team = res.data.filter((e) => e.reporting_manager?._id === managerId);
      setEmployees(team);
      const map = {};
      team.forEach((e) => { map[e._id] = e; });
      setEmpMap(map);
    }).catch(console.error);
  }, [managerId]);

  const fetchData = useCallback(async (page = 1, limit = pagination.limit) => {
    if (!managerId) return;
    setLoading(true);
    try {
      // Use the existing admin time-tracking endpoint but filter by team employees
      // The backend already supports the `employee` filter param
      const params = new URLSearchParams({
        page, limit,
        range: selectedRange,
        ...(projectSearch && { search: projectSearch }),
        ...(selectedEmployee && { employee: selectedEmployee }),
        ...(selectedRange === "custom" && customDates.from && { from: customDates.from }),
        ...(selectedRange === "custom" && customDates.to && { to: customDates.to }),
      });
      const { data } = await axios.get(`${API}/api/time-tracking?${params}`);
      // Filter to only show projects with team employees' subtasks client-side if needed
      setProjects(data.projects);
      setSummary(data.summary);
      setPagination({ ...data.pagination, limit });
      setOpenTable(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managerId, selectedRange, customDates, selectedEmployee, projectSearch]);

  const debouncedSearch = useDebounce(projectSearch);
  useEffect(() => { fetchData(1, pagination.limit); }, [selectedRange, customDates, selectedEmployee, debouncedSearch]);

  if (loading && !projects.length) return <LoadingOverlay />;

  return (
    <div className="dashboard-container">
      <section className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-button" onClick={() => navigate("/")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <h1 className="header-title">Team Time Tracking</h1>
          </div>
          <p className="project-name">Track time spent by your team across tasks and projects</p>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-info">
          <span className="stats-number">{summary.totalProjects}</span>
          <span>Projects ({summary.totalSubtasks} subtasks)</span>
        </div>
        <div className="stats-info">
          <span className="stats-number">{formatMs(summary.totalTimeMs)}</span>
          <span>Total Time Tracked</span>
        </div>
      </section>

      <section className="table-container">
        <div className="table-controls mb-4">
          <div className="controls-left flex justify-between flex-wrap gap-3">
            {/* Search */}
            <input type="text" placeholder="Search project…" value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="search-input" style={{ maxWidth: 240 }} />

            <div className="filter-group">
              <span className="filter-label">Time Range:</span>
              <div className="filter-options">
                {RANGE_OPTIONS.map(({ key, label }) => (
                  <button key={key}
                    className={`filter-btn ${selectedRange === key ? "active" : ""}`}
                    onClick={() => key === "custom" ? setShowCustomModal(true) : setSelectedRange(key)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <span className="filter-label">Employee:</span>
              <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}
                className="filter-select" style={{ width: 200 }}>
                <option value="">All Team Members</option>
                {employees.map((e) => <option key={e._id} value={e._id}>{e.full_name}</option>)}
              </select>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Showing {projects.length} of {pagination.total} projects
            {loading && <span className="ml-2 text-blue-500">↻ Updating…</span>}
          </p>
        </div>

        <div className="projects-list">
          {projects.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400">No time-tracked projects found.</div>
          )}
          {projects.map((project) => (
            <div key={project._id} className="project-item">
              <div className={`project-header ${openTable === project._id ? "open" : ""}`}
                onClick={() => setOpenTable((p) => p === project._id ? null : project._id)}>
                <div className="project-name">{project.project_name}</div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>🗂 <strong>{project.subtaskCount}</strong> subtasks</span>
                  <span>⏱ <strong>{formatMs(project.totalTimeMs)}</strong></span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transform: openTable === project._id ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>

              {openTable === project._id && (
                <div className="subtasks-table-container">
                  <table className="data-table">
                    <thead>
                      <tr><th>Subtask Name</th><th>Stages</th><th>Due Date</th><th>Remaining</th><th>Time Spent</th><th>Assigned To</th></tr>
                    </thead>
                    <tbody>
                      {project.subtasks.map((subtask) => {
                        const emp = empMap[subtask.assign_to?.toString()];
                        const { label, type } = getRemainingLabel(subtask.due_date, subtask.status);
                        return (
                          <tr key={subtask._id}>
                            <td><span className="task-name-text">{subtask.task_name}</span></td>
                            <td><StagePills stages={subtask.stages} /></td>
                            <td><span className="date-cell">{subtask.due_date ? moment(subtask.due_date).format("DD MMM YYYY") : "-"}</span></td>
                            <td><span className={`status-badge status-${type}`}><span className="status-dot" />{label}</span></td>
                            <td><span className="time-spent font-mono">{formatMs(subtask.timeSpentMs)}</span></td>
                            <td>
                              {emp ? (
                                <div className="assignee-cell">
                                  {emp.profile_pic
                                    ? <img src={emp.profile_pic} alt={emp.full_name} className="assignee-avatar" />
                                    : <div className="assignee-avatar-placeholder">{emp.full_name?.charAt(0).toUpperCase()}</div>}
                                  <span className="assignee-name">{emp.full_name}</span>
                                </div>
                              ) : <span className="no-data">Unassigned</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>

        <PaginationBar
          pagination={pagination}
          onPageChange={(p) => fetchData(p, pagination.limit)}
          onLimitChange={(l) => fetchData(1, l)}
          loading={loading}
        />
      </section>

      <CustomDateModal
        show={showCustomModal} onHide={() => setShowCustomModal(false)}
        dates={customDates} onDatesChange={setCustomDates}
        onApply={() => setSelectedRange("custom")}
      />
    </div>
  );
};