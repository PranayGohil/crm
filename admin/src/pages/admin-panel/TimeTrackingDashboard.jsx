// TimeTrackingDashboard.jsx — fully server-side filtering + pagination
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { Modal, Button } from "react-bootstrap";
import LoadingOverlay from "../../components/admin/LoadingOverlay";

const API = process.env.REACT_APP_API_URL;

// ─── debounce hook ────────────────────────────────────────────────────────────
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── format ms → "Xd Xh Xm Xs" ──────────────────────────────────────────────
const formatMs = (ms) => {
  if (!ms || ms <= 0) return "0h 0m 0s";
  const dur = moment.duration(ms);
  const days = Math.floor(dur.asDays());
  return [
    days > 0 && `${days}d`,
    `${dur.hours()}h`,
    `${dur.minutes()}m`,
    `${dur.seconds()}s`,
  ]
    .filter(Boolean)
    .join(" ");
};

// ─── remaining time label ─────────────────────────────────────────────────────
const getRemainingLabel = (dueDate, status) => {
  if (status === "Completed") return { label: "Completed", type: "completed" };
  const diff = moment(dueDate).diff(moment());
  if (diff < 0) return { label: "Overdue", type: "overdue" };
  const dur = moment.duration(diff);
  return {
    label: `${dur.days()}d ${dur.hours()}h ${dur.minutes()}m`,
    type: "pending",
  };
};

// ─── stage pills ──────────────────────────────────────────────────────────────
const StagePills = ({ stages }) => {
  if (!Array.isArray(stages) || !stages.length)
    return <span className="no-data">No stages</span>;
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {stages.map((stg, i) => {
        const name = typeof stg === "string" ? stg : stg.name;
        const done = !!stg?.completed;
        return (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <small
              style={{
                padding: "3px 8px",
                borderRadius: 12,
                fontSize: 11,
                background: done ? "#e6ffed" : "#f3f4f6",
                color: done ? "#097a3f" : "#444",
                border: `1px solid ${done ? "#b7f0c6" : "#e0e0e0"}`,
              }}
            >
              {done && "✓ "}
              {name}
            </small>
            {i < stages.length - 1 && (
              <span style={{ color: "#aaa", fontSize: 12 }}>→</span>
            )}
          </span>
        );
      })}
    </div>
  );
};

// ─── Assignee cell ────────────────────────────────────────────────────────────
const AssigneeCell = ({ employee }) => {
  if (!employee) return <span className="no-data">Unassigned</span>;
  return (
    <div className="assignee-cell">
      {employee.profile_pic ? (
        <img
          src={employee.profile_pic}
          alt={employee.full_name}
          className="assignee-avatar"
        />
      ) : (
        <div className="assignee-avatar-placeholder">
          {employee.full_name?.charAt(0).toUpperCase() || "?"}
        </div>
      )}
      <span className="assignee-name">{employee.full_name}</span>
    </div>
  );
};

// ─── Pagination bar ───────────────────────────────────────────────────────────
const Pagination = ({ pagination, onPageChange, onLimitChange, loading }) => {
  const { page, totalPages, limit } = pagination;
  if (totalPages <= 1 && limit === 15) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
    .reduce((acc, p, i, arr) => {
      if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex items-center justify-center gap-2 py-4 flex-wrap">
      <button
        className="px-3 py-1 rounded border text-sm disabled:opacity-40"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1 || loading}
      >
        ← Prev
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-2 text-gray-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            disabled={loading}
            className={`px-3 py-1 rounded border text-sm ${p === page
                ? "bg-blue-600 text-white border-blue-600"
                : "hover:bg-gray-100"
              }`}
          >
            {p}
          </button>
        )
      )}

      <button
        className="px-3 py-1 rounded border text-sm disabled:opacity-40"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages || loading}
      >
        Next →
      </button>

      <select
        className="ml-4 border rounded px-2 py-1 text-sm"
        value={limit}
        onChange={(e) => onLimitChange(Number(e.target.value))}
      >
        {[10, 15, 25, 50].map((n) => (
          <option key={n} value={n}>
            {n} / page
          </option>
        ))}
      </select>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const TimeTrackingDashboard = () => {
  const navigate = useNavigate();

  // reference data — loaded once
  const [employees, setEmployees] = useState([]);
  const [empMap, setEmpMap] = useState({});

  // server-driven data
  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState({ totalProjects: 0, totalSubtasks: 0, totalTimeMs: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // ui state
  const [loading, setLoading] = useState(true);
  const [openProject, setOpenProject] = useState(null);

  // filter state
  const [projectSearch, setProjectSearch] = useState("");
  const [subtaskSearch, setSubtaskSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedRange, setSelectedRange] = useState("all");
  const [customDates, setCustomDates] = useState({ from: "", to: "" });
  const [showCustomModal, setShowCustomModal] = useState(false);

  // debounced searches
  const debouncedProjectSearch = useDebounce(projectSearch);
  const debouncedSubtaskSearch = useDebounce(subtaskSearch);

  // ── load employees once ────────────────────────────────────────────────
  useEffect(() => {
    axios
      .get(`${API}/api/employee/get-all`)
      .then((res) => {
        setEmployees(res.data);
        const map = {};
        res.data.forEach((e) => { map[e._id] = e; });
        setEmpMap(map);
      })
      .catch(console.error);
  }, []);

  // ── fetch time-tracking data ───────────────────────────────────────────
  const fetchData = useCallback(
    async (page = 1, limit = pagination.limit) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page,
          limit,
          range: selectedRange,
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
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedProjectSearch, debouncedSubtaskSearch, selectedEmployee, selectedRange, customDates]
  );

  // Re-fetch on any filter change, reset to page 1
  useEffect(() => {
    fetchData(1, pagination.limit);
  }, [debouncedProjectSearch, debouncedSubtaskSearch, selectedEmployee, selectedRange, customDates]);

  const handleReset = () => {
    setProjectSearch("");
    setSubtaskSearch("");
    setSelectedEmployee("");
    setSelectedRange("all");
    setCustomDates({ from: "", to: "" });
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
    <div className="dashboard-container">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <section className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-button" onClick={() => navigate("/")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <h1 className="header-title">Subtasks Time Tracking</h1>
          </div>
          <p className="project-name">
            Track time spent by your team across tasks and projects
          </p>
        </div>
      </section>

      {/* ── Summary cards ───────────────────────────────────────────────── */}
      <section className="stats-section">
        <div className="stats-info">
          <span className="stats-number">{summary.totalProjects}</span>
          <span>Projects</span>
        </div>
        <div className="stats-info">
          <span className="stats-number">{summary.totalSubtasks}</span>
          <span>Subtasks with logs</span>
        </div>
        <div className="stats-info">
          <span className="stats-number">{formatMs(summary.totalTimeMs)}</span>
          <span>Total Time Tracked</span>
        </div>
      </section>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <section className="table-container">
        <div className="table-controls mb-4">
          {/* Row 1 — search inputs */}
          <div className="flex flex-wrap gap-3 mb-3">
            {/* Project search */}
            <div className="search-container flex items-center gap-2" style={{ flex: 1, minWidth: 200 }}>
              <input
                type="text"
                placeholder="Search project name…"
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="search-input"
              />
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>

            {/* Subtask search */}
            <div className="search-container flex items-center gap-2" style={{ flex: 1, minWidth: 200 }}>
              <input
                type="text"
                placeholder="Search subtask name…"
                value={subtaskSearch}
                onChange={(e) => setSubtaskSearch(e.target.value)}
                className="search-input"
              />
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>

            {/* Employee filter */}
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="filter-select"
              style={{ minWidth: 180 }}
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.full_name}</option>
              ))}
            </select>

            {/* Reset */}
            <button className="reset-button flex items-center gap-1" onClick={handleReset}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              Reset
            </button>
          </div>

          {/* Row 2 — time range pills */}
          <div className="filter-group flex items-center gap-2 flex-wrap">
            <span className="filter-label font-medium text-sm text-gray-600">Time Range:</span>
            <div className="filter-options flex gap-2 flex-wrap">
              {rangeLabels.map(({ key, label }) => (
                <button
                  key={key}
                  className={`filter-btn ${selectedRange === key ? "active" : ""}`}
                  onClick={() => {
                    if (key === "custom") {
                      setShowCustomModal(true);
                    } else {
                      setSelectedRange(key);
                    }
                  }}
                >
                  {label}
                  {key === "custom" && customDates.from && (
                    <span className="ml-1 text-xs opacity-75">
                      ({customDates.from} → {customDates.to || "…"})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Result count */}
          <p className="text-sm text-gray-500 mt-2">
            Showing {projects.length} of {pagination.total} projects
            {loading && <span className="ml-2 text-blue-500">↻ Updating…</span>}
          </p>
        </div>

        {/* ── Projects list ─────────────────────────────────────────────── */}
        <div className="projects-list">
          {projects.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400">
              No time-tracked projects found for the selected filters.
            </div>
          )}

          {projects.map((project) => (
            <div key={project._id} className="project-item">
              {/* Project header row */}
              <div
                className={`project-header ${openProject === project._id ? "open" : ""}`}
                onClick={() =>
                  setOpenProject((prev) =>
                    prev === project._id ? null : project._id
                  )
                }
              >
                <div className="project-info flex-1">
                  <span className="project-name font-semibold">{project.project_name}</span>
                  <span
                    className={`ml-3 text-xs px-2 py-0.5 rounded-full ${project.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : project.status === "In Progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {project.status}
                  </span>
                </div>

                <div className="project-meta flex items-center gap-6 text-sm text-gray-600">
                  <span>
                    🗂 <strong>{project.subtaskCount}</strong> subtask
                    {project.subtaskCount !== 1 && "s"}
                  </span>
                  <span>
                    ⏱ <strong>{formatMs(project.totalTimeMs)}</strong>
                  </span>
                </div>

                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    transform:
                      openProject === project._id
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    transition: "transform 0.2s",
                    flexShrink: 0,
                  }}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>

              {/* Expanded subtasks table */}
              {openProject === project._id && (
                <div className="subtasks-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subtask Name</th>
                        <th>Stages</th>
                        <th>Due Date</th>
                        <th>Remaining</th>
                        <th>Time Spent</th>
                        <th>Assigned To</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.subtasks.map((subtask) => {
                        const emp = empMap[subtask.assign_to?.toString()];
                        const { label, type } = getRemainingLabel(
                          subtask.due_date,
                          subtask.status
                        );
                        return (
                          <tr key={subtask._id}>
                            <td>
                              <span
                                className="task-name-text"
                                title={subtask.task_name}
                              >
                                {subtask.task_name}
                              </span>
                            </td>
                            <td>
                              <StagePills stages={subtask.stages} />
                            </td>
                            <td>
                              <span className="date-cell">
                                {subtask.due_date
                                  ? moment(subtask.due_date).format("DD MMM YYYY")
                                  : "-"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`status-badge status-${type}`}
                              >
                                <span className="status-dot" />
                                {label}
                              </span>
                            </td>
                            <td>
                              <span className="time-spent font-mono">
                                {formatMs(subtask.timeSpentMs)}
                              </span>
                            </td>
                            <td>
                              <AssigneeCell employee={emp} />
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

        {/* ── Pagination ────────────────────────────────────────────────── */}
        <Pagination
          pagination={pagination}
          onPageChange={(p) => fetchData(p, pagination.limit)}
          onLimitChange={(l) => fetchData(1, l)}
          loading={loading}
        />
      </section>

      {/* ── Custom date modal ────────────────────────────────────────────── */}
      <Modal
        show={showCustomModal}
        onHide={() => setShowCustomModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Custom Date Range</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="custom-date-inputs flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">From</label>
              <input
                type="date"
                className="form-control w-100"
                value={customDates.from}
                onChange={(e) =>
                  setCustomDates((prev) => ({ ...prev, from: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To</label>
              <input
                type="date"
                className="form-control w-100"
                value={customDates.to}
                onChange={(e) =>
                  setCustomDates((prev) => ({ ...prev, to: e.target.value }))
                }
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCustomModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!customDates.from && !customDates.to}
            onClick={() => {
              setSelectedRange("custom");
              setShowCustomModal(false);
            }}
          >
            Apply
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TimeTrackingDashboard;