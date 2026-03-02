// TimeTrackingDashboard.jsx
// Changes from original:
//   1. Added project-level pagination (10 projects per page)
//   2. Added project name search filter
//   3. All existing logic (team filtering, isWithinFilter, calculateTimeSpent) kept exactly as-is

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { Modal, Button } from "react-bootstrap";
import LoadingOverlay from "../components/LoadingOverlay";

const PROJECTS_PER_PAGE_OPTIONS = [5, 10, 20, 50];
const DEFAULT_PAGE_SIZE = 10;

const TimeTrackingDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("employeeUser"));

  const [projects, setProjects] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [openTable, setOpenTable] = useState(null);

  // ── existing filters (unchanged) ─────────────────────────────────────
  const [selectedFilter, setSelectedFilter] = useState("All Time");
  const [customDateRange, setCustomDateRange] = useState({ from: null, to: null });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("All");
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);

  // ── new: project name search + pagination ─────────────────────────────
  const [projectSearch, setProjectSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // ── fetch (same as original) ──────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projRes, subRes, empRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/project/get-all-archived`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/subtask/get-all`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/employee/get-all`),
        ]);

        const myEmployees = empRes.data.filter(
          (emp) => emp.reporting_manager?._id === user._id
        );
        const myEmployeeIds = myEmployees.map((emp) => emp._id);

        const mySubtasks = subRes.data.filter((s) =>
          myEmployeeIds.includes(
            s.assign_to ||
            s.time_logs.some((log) => myEmployeeIds.includes(log.user_id))
          )
        );

        const myProjects = projRes.data.filter((proj) =>
          mySubtasks.some((s) => s.project_id === proj._id)
        );

        setProjects(myProjects);
        setSubtasks(mySubtasks);
        setEmployees(myEmployees);
      } catch (error) {
        console.error("Data fetching error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── existing helpers (unchanged) ─────────────────────────────────────
  const handleToggle = (id) =>
    setOpenTable((prev) => (prev === id ? null : id));

  const isWithinFilter = (dateStr) => {
    const date = moment(dateStr);
    const now = moment();
    switch (selectedFilter) {
      case "Today":
        return date.isSame(now, "day");
      case "This Week":
        return date.isSame(now, "week");
      case "This Month":
        return date.isSame(now, "month");
      case "Custom":
        if (customDateRange.from && customDateRange.to) {
          const from = moment(customDateRange.from);
          const to = moment(customDateRange.to).endOf("day");
          return date.isBetween(from, to, null, "[]");
        }
        return false;
      case "All Time":
      default:
        return true;
    }
  };

  const calculateTimeSpent = (timeLogs) => {
    let total = 0;
    timeLogs?.forEach((log) => {
      if (log.start_time && log.end_time && isWithinFilter(log.start_time)) {
        const diff = moment(log.end_time).diff(moment(log.start_time), "seconds");
        total += diff;
      }
    });
    const duration = moment.duration(total, "seconds");
    return moment.utc(duration.asMilliseconds()).format("HH:mm:ss");
  };

  const calculateRemainingTime = (dueDate, status) => {
    if (status === "Completed") return "Completed";
    const now = moment();
    const due = moment(dueDate);
    const diff = due.diff(now);
    const duration = moment.duration(diff);
    return duration.asMilliseconds() < 0
      ? "Overdue"
      : `${duration.days()}d ${duration.hours()}h ${duration.minutes()}m`;
  };

  const getEmployeeById = (id) => employees.find((emp) => emp._id === id);

  // ── filtered subtasks (same logic as original) ────────────────────────
  const filteredSubtasks = useMemo(
    () =>
      subtasks.filter(
        (s) =>
          (selectedEmployeeId === "All" || s.assign_to === selectedEmployeeId) &&
          s.time_logs?.some((log) =>
            log.start_time && log.end_time ? isWithinFilter(log.start_time) : false
          )
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [subtasks, selectedEmployeeId, selectedFilter, customDateRange]
  );

  // ── projects that have matching subtasks + optional name search ───────
  const visibleProjects = useMemo(() => {
    const search = projectSearch.trim().toLowerCase();
    return projects.filter((proj) => {
      const hasSubtasks = filteredSubtasks.some((s) => s.project_id === proj._id);
      const matchesSearch = !search || proj.project_name?.toLowerCase().includes(search);
      return hasSubtasks && matchesSearch;
    });
  }, [projects, filteredSubtasks, projectSearch]);

  // ── pagination derived values ─────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(visibleProjects.length / pageSize));

  // Reset to page 1 whenever filters or search change
  useEffect(() => {
    setCurrentPage(1);
    setOpenTable(null);
  }, [selectedFilter, customDateRange, selectedEmployeeId, projectSearch, pageSize]);

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return visibleProjects.slice(start, start + pageSize);
  }, [visibleProjects, currentPage, pageSize]);

  // ── summary (across ALL filtered subtasks, not just current page) ─────
  const summaryData = useMemo(() => {
    const mainTasks = new Set(filteredSubtasks.map((s) => s.project_id)).size;
    const totalTimeTracked = filteredSubtasks.reduce((acc, sub) => {
      const time = sub.time_logs?.reduce((subTotal, log) => {
        if (log.start_time && log.end_time && isWithinFilter(log.start_time)) {
          return subTotal + moment(log.end_time).diff(moment(log.start_time), "seconds");
        }
        return subTotal;
      }, 0);
      return acc + (time ?? 0);
    }, 0);
    return { mainTasks, subtasks: filteredSubtasks.length, totalTimeTracked };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredSubtasks, selectedFilter, customDateRange]);

  const totalTimeTrackedFormatted = moment
    .utc(summaryData.totalTimeTracked * 1000)
    .format("HH:mm:ss");

  // ── pagination bar ────────────────────────────────────────────────────
  const PaginationBar = () => {
    if (totalPages <= 1 && pageSize === DEFAULT_PAGE_SIZE) return null;

    const getPageNumbers = () => {
      const pages = [];
      for (let i = 1; i <= totalPages; i++) {
        if (
          i === 1 ||
          i === totalPages ||
          (i >= currentPage - 2 && i <= currentPage + 2)
        ) {
          pages.push(i);
        } else if (
          (i === currentPage - 3 && currentPage > 4) ||
          (i === currentPage + 3 && currentPage < totalPages - 3)
        ) {
          pages.push("...");
        }
      }
      return [...new Set(pages)];
    };

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "16px 0 8px",
          flexWrap: "wrap",
        }}
      >
        {/* Prev */}
        <button
          className="filter-btn"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          style={{ opacity: currentPage === 1 ? 0.4 : 1 }}
        >
          ← Prev
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} style={{ color: "#aaa", padding: "0 4px" }}>
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                border: "1px solid #ddd",
                background: p === currentPage ? "#2563eb" : "#fff",
                color: p === currentPage ? "#fff" : "#374151",
                fontWeight: p === currentPage ? 600 : 400,
                cursor: "pointer",
                minWidth: 36,
              }}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          className="filter-btn"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          style={{ opacity: currentPage === totalPages ? 0.4 : 1 }}
        >
          Next →
        </button>

        {/* Page size selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 16 }}>
          <span style={{ fontSize: 13, color: "#666" }}>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="filter-select"
            style={{ width: "auto", padding: "4px 8px", fontSize: 13 }}
          >
            {PROJECTS_PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} projects
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  if (loading) return <LoadingOverlay />;

  return (
    <div className="dashboard-container">
      {/* Header — unchanged */}
      <section className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-button" onClick={() => navigate("/")}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
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

      {/* Stats — unchanged */}
      <section className="stats-section">
        <div className="stats-info">
          <span className="stats-number">{summaryData.mainTasks}</span>
          <span>Main Tasks ({summaryData.subtasks} subtasks)</span>
        </div>
        <div className="stats-info">
          <span className="stats-number">{totalTimeTrackedFormatted}</span>
          <span>Total Time Tracked</span>
        </div>
      </section>

      <section className="table-container">
        {/* Filters */}
        <div className="table-controls">
          <div className="controls-left flex justify-between flex-wrap gap-3">
            {/* Time range — unchanged */}
            <div className="filter-group">
              <span className="filter-label">Time Range:</span>
              <div className="filter-options">
                {["All Time", "Today", "This Week", "This Month", "Custom"].map(
                  (label) => (
                    <button
                      key={label}
                      className={`filter-btn ${selectedFilter === label ? "active" : ""
                        }`}
                      onClick={() => {
                        if (label === "Custom") {
                          setShowCustomDateModal(true);
                        } else {
                          setSelectedFilter(label);
                        }
                      }}
                    >
                      {label}
                      {label === "Custom" &&
                        selectedFilter === "Custom" &&
                        customDateRange.from && (
                          <span style={{ fontSize: 11, marginLeft: 4, opacity: 0.75 }}>
                            ({customDateRange.from} → {customDateRange.to || "…"})
                          </span>
                        )}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Employee filter — unchanged */}
            <div className="filter-group">
              <span className="filter-label">Employee:</span>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="filter-select"
                style={{ width: "200px" }}
              >
                <option value="All">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* NEW: project search + result count */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 12,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div className="search-container" style={{ position: "relative", maxWidth: 300 }}>
              <input
                type="text"
                placeholder="Search project name…"
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="search-input"
                style={{ paddingRight: 36 }}
              />
              {projectSearch && (
                <button
                  onClick={() => setProjectSearch("")}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#999",
                    fontSize: 16,
                    lineHeight: 1,
                  }}
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              Showing{" "}
              <strong>
                {Math.min((currentPage - 1) * pageSize + 1, visibleProjects.length)}–
                {Math.min(currentPage * pageSize, visibleProjects.length)}
              </strong>{" "}
              of <strong>{visibleProjects.length}</strong> projects
            </span>
          </div>
        </div>

        {/* Projects list */}
        <div className="projects-list">
          {visibleProjects.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ margin: "0 auto 16px", display: "block" }}
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              No projects found for the selected filters.
            </div>
          ) : (
            paginatedProjects.map((project) => {
              const projectSubtasks = filteredSubtasks.filter(
                (s) => s.project_id === project._id
              );

              const totalTime = projectSubtasks.reduce((acc, sub) => {
                const time = moment
                  .duration(calculateTimeSpent(sub.time_logs))
                  .asSeconds();
                return acc + time;
              }, 0);
              const duration = moment.duration(totalTime, "seconds");
              const formattedTime = `${duration.days()}d ${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`;

              return (
                <div key={project._id} className="project-item">
                  <div
                    className={`project-header ${openTable === project._id ? "open" : ""
                      }`}
                    onClick={() => handleToggle(project._id)}
                  >
                    <div className="project-name">{project.project_name}</div>
                    <div className="project-time">{formattedTime}</div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`dropdown-arrow ${openTable === project._id ? "rotated" : ""
                        }`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>

                  {openTable === project._id && (
                    <div className="subtasks-table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Subtask Name</th>
                            <th>Stage</th>
                            <th>Due Date</th>
                            <th>Remaining Time</th>
                            <th>Time Spent</th>
                            <th>Assigned Employees</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projectSubtasks.map((subtask, index) => {
                            const employee = getEmployeeById(subtask.assign_to);
                            const spent = calculateTimeSpent(subtask.time_logs);
                            const remaining = calculateRemainingTime(
                              subtask.due_date,
                              subtask.status
                            );

                            return (
                              <tr key={index}>
                                <td>
                                  <div className="task-name-cell">
                                    <span
                                      className="task-name-text"
                                      title={subtask.task_name}
                                    >
                                      {subtask.task_name}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  {Array.isArray(subtask.stages) &&
                                    subtask.stages.length > 0 ? (
                                    <div className="flex items-center gap-2">
                                      {subtask.stages.map((stg, i) => {
                                        const name =
                                          typeof stg === "string"
                                            ? stg
                                            : stg.name;
                                        const completed = stg?.completed;
                                        return (
                                          <span
                                            key={i}
                                            style={{
                                              display: "inline-flex",
                                              alignItems: "center",
                                              gap: "6px",
                                            }}
                                          >
                                            <small
                                              style={{
                                                padding: "4px 8px",
                                                borderRadius: "12px",
                                                background: completed
                                                  ? "#e6ffed"
                                                  : "#f3f4f6",
                                                color: completed
                                                  ? "#097a3f"
                                                  : "#444",
                                                border: completed
                                                  ? "1px solid #b7f0c6"
                                                  : "1px solid #e0e0e0",
                                                fontSize: "12px",
                                              }}
                                            >
                                              {completed ? "✓ " : ""}
                                              {name}
                                            </small>
                                            {i < subtask.stages.length - 1 && (
                                              <span style={{ margin: "0 6px" }}>
                                                →
                                              </span>
                                            )}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    "No stages"
                                  )}
                                </td>
                                <td>
                                  <span className="date-cell">
                                    {moment(subtask.due_date).format(
                                      "DD MMM YYYY"
                                    )}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={`status-badge ${remaining === "Completed"
                                        ? "status-completed"
                                        : remaining === "Overdue"
                                          ? "status-overdue"
                                          : "status-pending"
                                      }`}
                                  >
                                    <span className="status-dot"></span>
                                    {remaining}
                                  </span>
                                </td>
                                <td>
                                  <span className="time-spent">{spent}</span>
                                </td>
                                <td>
                                  <div className="assignee-cell">
                                    {employee?.profile_pic ? (
                                      <img
                                        src={employee.profile_pic}
                                        alt={employee.full_name}
                                        className="assignee-avatar"
                                      />
                                    ) : (
                                      <div className="assignee-avatar-placeholder">
                                        {employee?.full_name
                                          ?.charAt(0)
                                          .toUpperCase() || "?"}
                                      </div>
                                    )}
                                    <span className="assignee-name">
                                      {employee?.full_name || "N/A"}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination bar */}
        <PaginationBar />

        {/* Summary footer — unchanged, counts reflect full filtered set */}
        <div className="pagination-container">
          <div className="pagination-info">
            Showing{" "}
            <span className="highlight">{summaryData.mainTasks}</span> main
            tasks (
            <span className="highlight">{summaryData.subtasks}</span> subtasks)
          </div>
          <div className="pagination-info">
            Total time tracked:{" "}
            <span className="highlight">{totalTimeTrackedFormatted}</span>
          </div>
        </div>
      </section>

      {/* Custom Date Modal — unchanged */}
      <Modal
        show={showCustomDateModal}
        onHide={() => setShowCustomDateModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Custom Date Range</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="custom-date-inputs">
            <div className="input-group">
              <label>From:</label>
              <input
                type="date"
                className="form-control w-100"
                onChange={(e) =>
                  setCustomDateRange((prev) => ({
                    ...prev,
                    from: e.target.value,
                  }))
                }
              />
            </div>
            <div className="input-group">
              <label>To:</label>
              <input
                type="date"
                className="form-control w-100"
                onChange={(e) =>
                  setCustomDateRange((prev) => ({
                    ...prev,
                    to: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCustomDateModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setSelectedFilter("Custom");
              setShowCustomDateModal(false);
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