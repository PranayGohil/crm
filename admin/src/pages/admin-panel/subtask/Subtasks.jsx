import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { stageOptions, priorityOptions, statusOptions } from "../../../options";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";

dayjs.extend(duration);

const Subtasks = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [openRow, setOpenRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [bulkAssignTo, setBulkAssignTo] = useState("");
  const [bulkPriority, setBulkPriority] = useState("");

  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [summary, setSummary] = useState(null);

  const [filters, setFilters] = useState({
    client: "All Client",
    status: "Status",
    priority: "Priority",
    stage: "Stage",
    employee: "Employee",
  });

  const fetchAll = async () => {
    try {
      const [projectsRes, clientsRes, employeesRes] = await Promise.all([
        axios.get(
          `${process.env.REACT_APP_API_URL}/api/project/all-tasks-projects`
        ),
        axios.get(`${process.env.REACT_APP_API_URL}/api/client/get-all`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/employee/get-all`),
      ]);
      setProjects(projectsRes.data);
      setClients(clientsRes.data);
      setEmployees(employeesRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/statistics/summary`)
      .then((res) => {
        setSummary(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const clientIdToName = useMemo(() => {
    const map = {};
    clients.forEach((c) => {
      map[c._id] = c.full_name;
    });
    return map;
  }, [clients]);

  const filteredProjects = projects.filter((p) => {
    const clientName = clientIdToName[p.client_id];

    const matchClient =
      filters.client === "All Client" ||
      clientName?.toLowerCase() === filters.client.toLowerCase();

    const matchStatus =
      filters.status === "Status" ||
      p.subtasks?.some(
        (s) => s.status?.toLowerCase() === filters.status.toLowerCase()
      );

    const matchPriority =
      filters.priority === "Priority" ||
      p.priority?.toLowerCase() === filters.priority.toLowerCase();

    const matchStage =
      filters.stage === "Stage" ||
      p.subtasks?.some((s) => {
        if (!Array.isArray(s.stages) || s.stages.length === 0) return false;
        const index =
          typeof s.current_stage_index === "number" ? s.current_stage_index : 0;
        const currentStageName = s.stages?.[index]?.name?.toLowerCase() || "";
        return (
          currentStageName?.toLowerCase() === filters.stage.toLowerCase() ||
          s.stages.some(
            (ss) => ss?.name?.toLowerCase() === filters.stage.toLowerCase()
          )
        );
      });

    const matchEmployee =
      filters.employee === "Employee" ||
      p.subtasks?.some((s) => {
        const assignedEmp = employees.find((e) => e._id === s.assign_to);
        return assignedEmp?.full_name === filters.employee;
      });

    const matchSearch =
      p.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.status?.toLowerCase().includes(searchTerm.toLowerCase());

    return (
      matchClient &&
      matchStatus &&
      matchPriority &&
      matchStage &&
      matchEmployee &&
      matchSearch
    );
  });

  const getRemainingDays = (dueDate) => {
    if (!dueDate) return "-";
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? `${diffDays} days` : "Overdue";
  };

  const handleBulkUpdateAll = async () => {
    if (selectedTaskIds.length === 0) return;

    const update = {};
    if (bulkAssignTo) update.assign_to = bulkAssignTo;
    if (bulkPriority) update.priority = bulkPriority;

    if (Object.keys(update).length === 0) {
      toast.info("No changes selected.");
      return;
    }

    setLoading(true);
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/subtask/bulk-update`,
        {
          ids: selectedTaskIds,
          update,
        }
      );
      toast.success("Changes applied!");
      setBulkAssignTo("");
      setBulkPriority("");
      setSelectedTaskIds([]);
      fetchAll();
    } catch (err) {
      console.error(err);
      toast.error("Failed to apply changes.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkConfirmDelete = async () => {
    if (selectedTaskIds.length === 0) return;
    setLoading(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/subtask/bulk-delete`,
        { ids: selectedTaskIds }
      );
      toast.success("Deleted!");
      fetchAll();
      setSelectedTaskIds([]);
      setShowBulkDeleteModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Delete failed.");
    } finally {
      setLoading(false);
    }
  };

  const calculateProjectTotalTime = (subtasks = []) => {
    let totalMs = 0;
    subtasks.forEach((s) => {
      s.time_logs?.forEach((log) => {
        const start = dayjs(log.start_time);
        const end = log.end_time ? dayjs(log.end_time) : dayjs();
        totalMs += end.diff(start);
      });
    });

    const dur = dayjs.duration(totalMs);
    return `${dur.hours()}h ${dur.minutes()}m ${dur.seconds()}s`;
  };

  const calculateTimeTracked = (timeLogs = []) => {
    let totalMs = 0;
    timeLogs.forEach((log) => {
      const start = dayjs(log.start_time);
      const end = log.end_time ? dayjs(log.end_time) : dayjs();
      totalMs += end.diff(start);
    });

    const dur = dayjs.duration(totalMs);
    return `${dur.hours()}h ${dur.minutes()}m ${dur.seconds()}s`;
  };

  const handleCopyToClipboard = (url, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.ctrlKey || e.metaKey) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("URL copied to clipboard!"))
      .catch(() => toast.error("Failed to copy URL."));
  };

  const handleResetFilters = () => {
    setFilters({
      client: "All Client",
      status: "Status",
      priority: "Priority",
      stage: "Stage",
      employee: "Employee",
    });
    setSearchTerm("");
  };

  const formateDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  if (loading) return <LoadingOverlay />;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <section className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-button" onClick={() => navigate(-1)}>
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
            <h1 className="header-title">All Subtasks</h1>
          </div>

          {/* Stats Card */}
          <div className="w-[500px] card p-3 shadow border-0">
            <div className="md-common-para-icon md-para-icon-tasks">
              <span>Subtasks</span>
              <div className="md-common-icon">
                <img src="SVG/true-green.svg" alt="total tasks" />
              </div>
            </div>
            <div className="md-total-project-number">
              <span className="md-total-card-number">{summary.totalTasks}</span>
              <span className="md-total-card-text">Total</span>
            </div>
            <div className="mt-8 md-btn-cio">
              {summary.tasksByStage &&
                Object.entries(summary.tasksByStage).map(([stage, count]) => (
                  <div
                    key={stage}
                    className={`${
                      stage === "CAD Design"
                        ? "badge bg-primary"
                        : stage === "SET Design"
                        ? "badge bg-success"
                        : stage === "Render"
                        ? "badge bg-info"
                        : ""
                    } `}
                  >
                    {count} {stage} Tasks Remaining
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="controls-section">
        <div className="controls-left mb-3 flex justify-between">
          <div className="search-container flex items-center gap-3">
            <input
              type="text"
              placeholder="Search by name, client, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <svg
              className="search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <div className="filter-controls flex items-center gap-3 flex-col md:flex-row">
            {/* Client Filter */}
            <div className="filter-dropdown">
              <select
                value={filters.client}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, client: e.target.value }))
                }
                className="filter-select"
              >
                <option value="All Client">All Clients</option>
                {clients.map((c) => (
                  <option key={c._id} value={c.full_name}>
                    {c.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="filter-dropdown">
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="filter-select"
              >
                <option value="Status">All Status</option>
                {statusOptions.map((opt, idx) => (
                  <option key={idx} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="filter-dropdown">
              <select
                value={filters.priority}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, priority: e.target.value }))
                }
                className="filter-select"
              >
                <option value="Priority">All Priority</option>
                {priorityOptions.map((opt, idx) => (
                  <option key={idx} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Stage Filter */}
            <div className="filter-dropdown">
              <select
                value={filters.stage}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, stage: e.target.value }))
                }
                className="filter-select"
              >
                <option value="Stage">All Stages</option>
                {stageOptions.map((opt, idx) => (
                  <option key={idx} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee Filter */}
            <div className="filter-dropdown">
              <select
                value={filters.employee}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, employee: e.target.value }))
                }
                className="filter-select"
              >
                <option value="Employee">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp.full_name}>
                    {emp.full_name}
                  </option>
                ))}
              </select>
            </div>

            <button className="reset-button" onClick={handleResetFilters}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              Reset All
            </button>
          </div>
        </div>
      </section>

      {/* Projects Table */}
      <section className="table-container">
        <div className="table-wrapper  overflow-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="expand-column"></th>
                <th>Project Name</th>
                <th>Client</th>
                <th>Status</th>
                <th>Subtasks</th>
                <th>Total Time</th>
                <th>Priority</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Remaining Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project, idx) => (
                <React.Fragment key={project._id}>
                  <tr className="project-row">
                    <td>
                      <button
                        className={`expand-button ${
                          openRow === idx ? "expanded" : ""
                        }`}
                        onClick={() => setOpenRow(openRow === idx ? null : idx)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </button>
                    </td>
                    <td>
                      <div className="project-name-cell">
                        <span
                          className="project-name-text"
                          title={project.project_name}
                        >
                          {project.project_name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="client-name">
                        {clientIdToName[project.client_id] || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge status-${
                          project.status?.toLowerCase().replace(" ", "-") ||
                          "default"
                        }`}
                      >
                        <span className="status-dot"></span>
                        {project.status}
                      </span>
                    </td>
                    {(() => {
                      const filteredSubtasks =
                        project.subtasks?.filter((s) => {
                          const stageMatch =
                            filters.stage === "Stage" ||
                            s.stages[
                              s.current_stage_index
                            ]?.name?.toLowerCase() ===
                              filters.stage.toLowerCase();

                          const statusMatch =
                            filters.status === "Status" ||
                            s.status?.toLowerCase() ===
                              filters.status.toLowerCase();

                          const employeeMatch =
                            filters.employee === "Employee" ||
                            employees.find((e) => e._id === s.assign_to)
                              ?.full_name === filters.employee;

                          return stageMatch && statusMatch && employeeMatch;
                        }) || [];

                      return (
                        <>
                          <td>
                            <span className="subtask-count">
                              {filteredSubtasks.length}
                            </span>
                          </td>
                          <td>
                            <span className="time-cell">
                              {calculateProjectTotalTime(filteredSubtasks)}
                            </span>
                          </td>
                        </>
                      );
                    })()}
                    <td>
                      <span
                        className={`priority-badge priority-${
                          project.priority?.toLowerCase().replace(" ", "-") ||
                          "default"
                        }`}
                      >
                        {project.priority}
                      </span>
                    </td>
                    <td>
                      <span className="date-cell">
                        {project.assign_date
                          ? formateDate(project.assign_date)
                          : "-"}
                      </span>
                    </td>
                    <td>
                      <span className="date-cell">
                        {project.due_date ? formateDate(project.due_date) : "-"}
                      </span>
                    </td>
                    <td>
                      <span className="remaining-time">
                        {getRemainingDays(project.due_date)}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <Link
                          to={`/project/edit/${project.id}`}
                          className="action-btn edit-btn"
                          title="Edit Project"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </Link>
                        <Link
                          to={`/project/details/${project.id}`}
                          className="action-btn view-btn"
                          title="View Project"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>

                  {/* Expandable subtasks row */}
                  {openRow === idx && (
                    <tr className="subtasks-expanded-row">
                      <td colSpan="11" className="subtasks-container">
                        <div className="subtasks-table-wrapper">
                          <table className="subtasks-table w-100">
                            <thead>
                              <tr>
                                <th className="checkbox-column">
                                  <input
                                    type="checkbox"
                                    className="checkbox-input"
                                    checked={
                                      project.subtasks?.every((s) =>
                                        selectedTaskIds.includes(s.id)
                                      ) && project.subtasks?.length > 0
                                    }
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        const projectSubtaskIds =
                                          project.subtasks?.map((s) => s.id) ||
                                          [];
                                        setSelectedTaskIds((prev) => [
                                          ...new Set([
                                            ...prev,
                                            ...projectSubtaskIds,
                                          ]),
                                        ]);
                                      } else {
                                        const projectSubtaskIds =
                                          project.subtasks?.map((s) => s.id) ||
                                          [];
                                        setSelectedTaskIds((prev) =>
                                          prev.filter(
                                            (id) =>
                                              !projectSubtaskIds.includes(id)
                                          )
                                        );
                                      }
                                    }}
                                  />
                                </th>
                                <th>Subtask Name</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Stages</th>
                                <th>URL</th>
                                <th>Assigned To</th>
                                <th>Time Tracked</th>
                                <th>Due Date</th>
                                <th>Remaining</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {project.subtasks
                                ?.filter((s) => {
                                  const stageMatch =
                                    filters.stage === "Stage" ||
                                    s.stages[
                                      s.current_stage_index
                                    ]?.name?.toLowerCase() ===
                                      filters.stage.toLowerCase();

                                  const statusMatch =
                                    filters.status === "Status" ||
                                    s.status?.toLowerCase() ===
                                      filters.status.toLowerCase();

                                  const employeeMatch =
                                    filters.employee === "Employee" ||
                                    employees.find((e) => e._id === s.assign_to)
                                      ?.full_name === filters.employee;

                                  return (
                                    stageMatch && statusMatch && employeeMatch
                                  );
                                })
                                .map((s, sIdx) => (
                                  <tr key={s.id}>
                                    <td>
                                      <input
                                        type="checkbox"
                                        className="checkbox-input"
                                        checked={selectedTaskIds.includes(s.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedTaskIds([
                                              ...selectedTaskIds,
                                              s.id,
                                            ]);
                                          } else {
                                            setSelectedTaskIds(
                                              selectedTaskIds.filter(
                                                (id) => id !== s.id
                                              )
                                            );
                                          }
                                        }}
                                      />
                                    </td>
                                    <td>
                                      <div className="task-name-cell">
                                        <span
                                          className="task-name-text"
                                          title={s.task_name}
                                        >
                                          {s.task_name}
                                        </span>
                                      </div>
                                    </td>
                                    <td>
                                      <span
                                        className={`status-badge status-${
                                          s.status
                                            ?.toLowerCase()
                                            .replace(" ", "-") || "default"
                                        }`}
                                      >
                                        <span className="status-dot"></span>
                                        {s.status}
                                      </span>
                                    </td>
                                    <td>
                                      <span
                                        className={`priority-badge priority-${
                                          s.priority
                                            ?.toLowerCase()
                                            .replace(" ", "-") || "default"
                                        }`}
                                      >
                                        {s.priority}
                                      </span>
                                    </td>
                                    <td>
                                      {Array.isArray(s.stages) &&
                                      s.stages.length > 0 ? (
                                        <div className="stages-container">
                                          {s.stages.map((stg, i) => {
                                            const name =
                                              typeof stg === "string"
                                                ? stg
                                                : stg.name;
                                            const completed = stg?.completed;
                                            return (
                                              <div
                                                key={i}
                                                className="stage-flow"
                                              >
                                                <span
                                                  className={`stage-badge ${
                                                    completed
                                                      ? "completed"
                                                      : "pending"
                                                  }`}
                                                >
                                                  {completed && (
                                                    <span className="check-icon">
                                                      ✓
                                                    </span>
                                                  )}
                                                  {name}
                                                </span>
                                                {i < s.stages.length - 1 && (
                                                  <span className="stage-arrow">
                                                    →
                                                  </span>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <span className="no-data">
                                          No stages
                                        </span>
                                      )}
                                    </td>
                                    <td>
                                      {s.url ? (
                                        <div
                                          className="url-cell"
                                          onClick={(e) =>
                                            handleCopyToClipboard(s.url, e)
                                          }
                                          title="Click to copy • Ctrl+Click to open"
                                        >
                                          <span className="url-text">
                                            {s.url}
                                          </span>
                                          <div className="copy-icon-wrapper">
                                            <svg
                                              className="copy-icon"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                            >
                                              <rect
                                                x="9"
                                                y="9"
                                                width="13"
                                                height="13"
                                                rx="2"
                                                ry="2"
                                              ></rect>
                                              <path d="m5 15-4-4 4-4"></path>
                                            </svg>
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="no-data">No URL</span>
                                      )}
                                    </td>
                                    <td>
                                      {(() => {
                                        const assignedEmp = employees.find(
                                          (emp) => emp._id === s.assign_to
                                        );
                                        if (!assignedEmp)
                                          return (
                                            <span className="no-data">
                                              Unassigned
                                            </span>
                                          );

                                        const firstLetter =
                                          assignedEmp.full_name
                                            ?.charAt(0)
                                            .toUpperCase() || "?";

                                        return (
                                          <div className="assignee-cell">
                                            {assignedEmp.profile_pic ? (
                                              <img
                                                src={assignedEmp.profile_pic}
                                                alt={assignedEmp.full_name}
                                                className="assignee-avatar"
                                              />
                                            ) : (
                                              <div className="assignee-avatar-placeholder">
                                                {firstLetter}
                                              </div>
                                            )}
                                            <span className="assignee-name">
                                              {assignedEmp.full_name}
                                            </span>
                                          </div>
                                        );
                                      })()}
                                    </td>
                                    <td>
                                      <span className="time-cell">
                                        {calculateTimeTracked(s.time_logs)}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="date-cell">
                                        {s.due_date
                                          ? formateDate(s.due_date)
                                          : "-"}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="remaining-time">
                                        {getRemainingDays(s.due_date)}
                                      </span>
                                    </td>
                                    <td>
                                      <div className="actions-cell">
                                        <Link
                                          to={`/project/subtask/edit/${s.id}`}
                                          className="action-btn edit-btn"
                                          title="Edit"
                                        >
                                          <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                          >
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                          </svg>
                                        </Link>
                                        <Link
                                          to={`/subtask/view/${s.id}`}
                                          className="action-btn view-btn"
                                          title="View"
                                        >
                                          <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                          >
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle
                                              cx="12"
                                              cy="12"
                                              r="3"
                                            ></circle>
                                          </svg>
                                        </Link>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bulk Actions */}
        {selectedTaskIds.length > 0 && (
          <div className="bulk-actions">
            <div className="bulk-actions-header">
              <span>
                <span className="bulk-count">{selectedTaskIds.length}</span>{" "}
                items selected
              </span>
              <div className="bulk-controls">
                <select
                  value={bulkAssignTo}
                  onChange={(e) => setBulkAssignTo(e.target.value)}
                  className="filter-select"
                  style={{ maxWidth: "150px" }}
                >
                  <option value="">👤 Assign To</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.full_name}
                    </option>
                  ))}
                </select>

                <select
                  value={bulkPriority}
                  onChange={(e) => setBulkPriority(e.target.value)}
                  className="filter-select"
                  style={{ maxWidth: "150px" }}
                >
                  <option value="">⚡ Set Priority</option>
                  {priorityOptions.map((opt, idx) => (
                    <option key={idx} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleBulkUpdateAll}
                  className="bulk-btn bulk-btn-primary"
                  disabled={!bulkAssignTo && !bulkPriority}
                >
                  ✓ Apply Changes
                </button>

                <button
                  className="bulk-btn bulk-btn-danger"
                  onClick={() => setShowBulkDeleteModal(true)}
                >
                  🗑️ Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Bulk Delete Modal */}
      <Modal
        show={showBulkDeleteModal}
        onHide={() => setShowBulkDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete{" "}
          <strong>{selectedTaskIds.length}</strong> selected subtask(s)?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowBulkDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleBulkConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Subtasks;
