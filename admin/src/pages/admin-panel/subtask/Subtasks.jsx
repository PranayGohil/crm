// Subtasks.jsx — server-side pagination + filtering
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Modal, Button } from "react-bootstrap";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { stageOptions, priorityOptions, statusOptions } from "../../../options";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";
import ClientSearchableSelect from "../../../components/common/ClientSearchableSelect";
import EmployeeSearchableSelect from "../../../components/common/EmployeeSearchableSelect";
import SearchableSelect from "../../../components/common/SearchableSelect";
import { useAuth } from "../../../contexts/AuthContext";

dayjs.extend(duration);

const API = process.env.REACT_APP_API_URL;

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const formateDate = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2, "0")} ${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
};

const getRemainingDays = (dueDate) => {
  if (!dueDate) return "-";
  const diff = Math.ceil((new Date(dueDate) - new Date()) / 86400000);
  return diff >= 0 ? `${diff}d` : "Overdue";
};

const calculateTimeTracked = (timeLogs = []) => {
  let ms = 0;
  timeLogs.forEach((log) => {
    ms += dayjs(log.end_time ?? undefined).diff(dayjs(log.start_time));
  });
  const dur = dayjs.duration(ms);
  return `${dur.hours()}h ${dur.minutes()}m`;
};

const calculateProjectTotalTime = (subtasks = []) => {
  let ms = 0;
  subtasks.forEach((s) =>
    (s.time_logs ?? []).forEach((log) => {
      ms += dayjs(log.end_time ?? undefined).diff(dayjs(log.start_time));
    }),
  );
  const dur = dayjs.duration(ms);
  return `${dur.hours()}h ${dur.minutes()}m`;
};

const SortIcon = ({ columnKey, sortConfig }) => {
  const base = { marginLeft: 4 };
  if (sortConfig.key !== columnKey)
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ ...base, opacity: 0.3 }}
      >
        <path d="M12 5v14M5 12l7 7 7-7" />
      </svg>
    );
  return sortConfig.direction === "asc" ? (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={base}
    >
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  ) : (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={base}
    >
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  );
};

const naturalSort = (a, b) => {
  const re = /(\d+)|(\D+)/g;
  const ap = a.match(re) ?? [];
  const bp = b.match(re) ?? [];
  for (let i = 0; i < Math.max(ap.length, bp.length); i++) {
    const av = ap[i] ?? "",
      bv = bp[i] ?? "";
    if (/^\d+$/.test(av) && /^\d+$/.test(bv)) {
      const d = parseInt(av, 10) - parseInt(bv, 10);
      if (d !== 0) return d;
    } else {
      const d = av.localeCompare(bv);
      if (d !== 0) return d;
    }
  }
  return 0;
};

const getSortedSubtasks = (subtasks, sortConfig) => {
  if (!sortConfig.key || !subtasks) return subtasks;
  return [...subtasks].sort((a, b) => {
    if (sortConfig.key === "name") {
      const r = naturalSort(
        (a.task_name ?? "").toLowerCase(),
        (b.task_name ?? "").toLowerCase(),
      );
      return sortConfig.direction === "asc" ? r : -r;
    }
    if (sortConfig.key === "dueDate") {
      const da = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const db2 = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      return sortConfig.direction === "asc" ? da - db2 : db2 - da;
    }
    return 0;
  });
};

const Subtasks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [rawClients, setRawClients] = useState([]);
  const [rawEmployees, setRawEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    client: "",
    status: "",
    priority: "",
    stage: "",
    employee: "",
    subtaskStatus: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 400);

  const [openRow, setOpenRow] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [bulkAssignTo, setBulkAssignTo] = useState("");
  const [bulkPriority, setBulkPriority] = useState("");
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Derive the current active stage (first non-completed) for each selected subtask.
  // Used to filter the assign dropdown to only show eligible employees.
  const selectedStageNames = useMemo(() => {
    const allSubtasks = projects.flatMap((p) => p.subtasks ?? []);
    const names = new Set();
    selectedTaskIds.forEach((id) => {
      const subtask = allSubtasks.find((s) => s._id === id);
      if (subtask?.stages) {
        const activeStage = subtask.stages.find((stg) => !stg.completed);
        if (activeStage) names.add(typeof activeStage === "string" ? activeStage : activeStage.name);
      }
    });
    return Array.from(names);
  }, [selectedTaskIds, projects]);

  // When active stages change, clear any previously chosen employee (may no longer be valid)
  useEffect(() => {
    setBulkAssignTo("");
  }, [selectedStageNames.join(",")]);	// eslint-disable-line

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get(`${API}/api/client/get-all`, { headers }),
      axios.get(`${API}/api/employee/get-all`, { headers }),
      axios.get(`${API}/api/statistics/summary`, { headers }),
    ])
      .then(([cl, em, sm]) => {
        setRawClients(cl.data);
        setRawEmployees(em.data);
        setSummary(sm.data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const filterAllowedClients = () => {
      if (!rawClients || rawClients.length === 0) return;
      const allowed = rawClients.filter(c => {
        if (!user) return true;
        if (user.role === "super-admin") return true;
        const adminStages = user.manage_stages || [];
        const clientStages = c.stages || [];
        if (clientStages.length === 0) return true;
        return clientStages.some(s => adminStages.includes(s));
      });
      setClients(allowed);
    };

    const filterAllowedEmployees = () => {
      if (!rawEmployees || rawEmployees.length === 0) return;
      const allowed = rawEmployees.filter(emp => {
        if (!user) return true;
        if (user.role === "super-admin") return true;
        const adminStages = user.manage_stages || [];
        const empStages = emp.manage_stages || [];
        if (empStages.length === 0) return true;
        return empStages.some(s => adminStages.includes(s));
      });
      setEmployees(allowed);
    };

    filterAllowedClients();
    filterAllowedEmployees();
  }, [user, rawClients, rawEmployees]);

  const fetchProjects = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page,
          limit: pagination.limit,
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(filters.client && { client: filters.client }),
          ...(filters.status && { status: filters.status }),
          ...(filters.priority && { priority: filters.priority }),
          ...(filters.stage && { stage: filters.stage }),
          ...(filters.employee && { employee: filters.employee }),
          ...(filters.subtaskStatus && {
            subtaskStatus: filters.subtaskStatus,
          }),
        });
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API}/api/project/all-tasks-projects?${params}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setProjects(res.data.projects);
        setPagination(res.data.pagination);
        setOpenRow(null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load projects.");
      } finally {
        setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [debouncedSearch, filters, pagination.limit],
  );

  useEffect(() => {
    fetchProjects(1);
  }, [debouncedSearch, filters]);

  const clientIdToName = useMemo(() => {
    const map = {};
    clients.forEach((c) => {
      map[c._id] = c.full_name;
    });
    return map;
  }, [clients]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setFilters({
      client: "",
      status: "",
      priority: "",
      stage: "",
      employee: "",
      subtaskStatus: "",
    });
  };

  const handleBulkUpdateAll = async () => {
    if (!selectedTaskIds.length) return;
    const update = {};
    if (bulkAssignTo) update.assign_to = bulkAssignTo;
    if (bulkPriority) update.priority = bulkPriority;
    if (!Object.keys(update).length) return toast.info("No changes selected.");
    setLoading(true);
    try {
      await axios.put(
        `${API}/api/subtask/bulk-update`,
        { ids: selectedTaskIds, update },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      toast.success("Changes applied!");
      setBulkAssignTo("");
      setBulkPriority("");
      setSelectedTaskIds([]);
      fetchProjects(pagination.page);
    } catch (err) {
      toast.error("Failed to apply changes.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkConfirmDelete = async () => {
    if (!selectedTaskIds.length) return;
    setLoading(true);
    try {
      await axios.post(
        `${API}/api/subtask/bulk-delete`,
        { ids: selectedTaskIds },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      toast.success("Deleted!");
      setSelectedTaskIds([]);
      setShowBulkDeleteModal(false);
      fetchProjects(pagination.page);
    } catch (err) {
      toast.error("Delete failed.");
    } finally {
      setLoading(false);
    }
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
      .then(() => toast.success("URL copied!"))
      .catch(() => toast.error("Failed to copy."));
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  if (loading && !projects.length) return <LoadingOverlay />;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <section className="dashboard-header">
        <div
          className="header-content"
          style={{ flexWrap: "wrap", gap: "12px" }}
        >
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

          {summary && (
            <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm w-full sm:w-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Subtasks
                </span>
                <span className="text-2xl font-bold text-gray-800">
                  {summary.totalTasks}
                </span>
              </div>
              {summary.tasksByStage && (
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(summary.tasksByStage).map(
                    ([stage, count]) => (
                      <div
                        key={stage}
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          stage === "CAD Design"
                            ? "bg-blue-100 text-blue-800"
                            : stage === "SET Design"
                              ? "bg-green-100 text-green-800"
                              : stage === "Render"
                                ? "bg-purple-100 text-purple-800"
                                : stage === "QC"
                                  ? "bg-cyan-100 text-cyan-800"
                                  : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {count} {stage}
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Controls */}
      <section className="controls-section">
        {/* Search + Filter toggle row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div
            className="search-container flex items-center gap-2 flex-1"
            style={{ minWidth: "180px" }}
          >
            <input
              type="text"
              placeholder="Search projects..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input flex-1"
            />
          </div>

          {/* Mobile filter toggle */}
          <button
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 relative"
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button className="reset-button" onClick={handleResetFilters}>
            <svg
              width="16"
              height="16"
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
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Filter dropdowns — collapsible on mobile */}
        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <ClientSearchableSelect
              placeholder="All Clients"
              label={null}
              isClearable
              value={
                filters.client
                  ? {
                      value: filters.client,
                      label:
                        clientIdToName[filters.client] || "Selected Client",
                    }
                  : null
              }
              onChange={(opt) =>
                setFilters((p) => ({ ...p, client: opt ? opt.value : "" }))
              }
            />
            <SearchableSelect
              placeholder="All Status"
              value={
                filters.status
                  ? { value: filters.status, label: filters.status }
                  : null
              }
              onChange={(opt) =>
                setFilters((p) => ({ ...p, status: opt ? opt.value : "" }))
              }
              options={statusOptions.map((o) => ({ value: o, label: o }))}
            />
            <SearchableSelect
              placeholder="All Priority"
              value={
                filters.priority
                  ? { value: filters.priority, label: filters.priority }
                  : null
              }
              onChange={(opt) =>
                setFilters((p) => ({ ...p, priority: opt ? opt.value : "" }))
              }
              options={priorityOptions.map((o) => ({ value: o, label: o }))}
            />
            <SearchableSelect
              placeholder="All Stages"
              value={
                filters.stage
                  ? { value: filters.stage, label: filters.stage }
                  : null
              }
              onChange={(opt) =>
                setFilters((p) => ({ ...p, stage: opt ? opt.value : "" }))
              }
              options={stageOptions.map((o) => ({ value: o, label: o }))}
            />
            <SearchableSelect
              placeholder="Subtask Status"
              value={
                filters.subtaskStatus
                  ? {
                      value: filters.subtaskStatus,
                      label: filters.subtaskStatus,
                    }
                  : null
              }
              onChange={(opt) =>
                setFilters((p) => ({
                  ...p,
                  subtaskStatus: opt ? opt.value : "",
                }))
              }
              options={statusOptions.map((o) => ({ value: o, label: o }))}
            />
            <EmployeeSearchableSelect
              placeholder="All Employees"
              label={null}
              isClearable
              value={
                filters.employee
                  ? {
                      value: filters.employee,
                      label:
                        employees.find((e) => e._id === filters.employee)
                          ?.full_name || "Selected Employee",
                    }
                  : null
              }
              onChange={(opt) =>
                setFilters((p) => ({ ...p, employee: opt ? opt.value : "" }))
              }
            />
          </div>
        )}

        <p className="text-xs sm:text-sm text-gray-500">
          {projects.length} of {pagination.total} projects
          {loading && <span className="ml-2 text-blue-500">↻</span>}
        </p>
      </section>

      {/* Table */}
      <section className="table-container">
        <div
          className="table-wrapper"
          style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}
        >
          <table className="data-table" style={{ minWidth: "900px" }}>
            <thead>
              <tr>
                <th className="expand-column"></th>
                <th>Project Name</th>
                <th>Client</th>
                <th>Status</th>
                <th>Subtasks</th>
                <th>Time</th>
                <th>Priority</th>
                <th>Start</th>
                <th>End</th>
                <th>Left</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, idx) => (
                <React.Fragment key={project._id}>
                  <tr className="project-row">
                    <td>
                      <button
                        className={`expand-button ${openRow === idx ? "expanded" : ""}`}
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
                      <span
                        className="project-name-text"
                        title={project.project_name}
                      >
                        {project.project_name}
                      </span>
                    </td>
                    <td>
                      <span className="client-name">
                        {clientIdToName[project.client_id] || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge status-${project.status?.toLowerCase().replace(" ", "-") || "default"}`}
                      >
                        <span className="status-dot"></span>
                        {project.status}
                      </span>
                    </td>
                    <td>
                      <span className="subtask-count">
                        {project.subtasks?.length ?? 0}
                      </span>
                    </td>
                    <td>
                      <span className="time-cell">
                        {calculateProjectTotalTime(project.subtasks)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`priority-badge priority-${project.priority?.toLowerCase().replace(" ", "-") || "default"}`}
                      >
                        {project.priority}
                      </span>
                    </td>
                    <td>
                      <span className="date-cell">
                        {formateDate(project.assign_date)}
                      </span>
                    </td>
                    <td>
                      <span className="date-cell">
                        {formateDate(project.due_date)}
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
                          to={`/project/edit/${project._id}`}
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
                          to={`/project/details/${project._id}`}
                          className="action-btn view-btn"
                          title="View Project"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded subtasks */}
                  {openRow === idx && (
                    <tr className="subtasks-expanded-row">
                      <td colSpan="11" className="subtasks-container">
                        <div
                          className="subtasks-table-wrapper"
                          style={{
                            overflowX: "auto",
                            WebkitOverflowScrolling: "touch",
                          }}
                        >
                          <table
                            className="subtasks-table w-100"
                            style={{ minWidth: "800px" }}
                          >
                            <thead>
                              <tr>
                                <th className="checkbox-column">
                                  <input
                                    type="checkbox"
                                    className="checkbox-input"
                                    checked={
                                      project.subtasks?.every((s) =>
                                        selectedTaskIds.includes(s._id),
                                      ) && project.subtasks?.length > 0
                                    }
                                    onChange={(e) => {
                                      const ids =
                                        project.subtasks?.map((s) => s._id) ??
                                        [];
                                      setSelectedTaskIds((prev) =>
                                        e.target.checked
                                          ? [...new Set([...prev, ...ids])]
                                          : prev.filter(
                                              (id) => !ids.includes(id),
                                            ),
                                      );
                                    }}
                                  />
                                </th>
                                <th
                                  onClick={() => handleSort("name")}
                                  style={{ cursor: "pointer" }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    Name{" "}
                                    <SortIcon
                                      columnKey="name"
                                      sortConfig={sortConfig}
                                    />
                                  </div>
                                </th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Stages</th>
                                <th>URL</th>
                                <th>Assigned</th>
                                <th>Time</th>
                                <th
                                  onClick={() => handleSort("dueDate")}
                                  style={{ cursor: "pointer" }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    Due{" "}
                                    <SortIcon
                                      columnKey="dueDate"
                                      sortConfig={sortConfig}
                                    />
                                  </div>
                                </th>
                                <th>Left</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getSortedSubtasks(
                                project.subtasks,
                                sortConfig,
                              ).map((s) => {
                                const assignedEmp = employees.find(
                                  (e) => e._id === s.assign_to?.toString(),
                                );
                                return (
                                  <tr key={s._id}>
                                    <td>
                                      <input
                                        type="checkbox"
                                        className="checkbox-input"
                                        checked={selectedTaskIds.includes(
                                          s._id,
                                        )}
                                        onChange={(e) =>
                                          setSelectedTaskIds((prev) =>
                                            e.target.checked
                                              ? [...prev, s._id]
                                              : prev.filter(
                                                  (id) => id !== s._id,
                                                ),
                                          )
                                        }
                                      />
                                    </td>
                                    <td>
                                      <span
                                        className="task-name-text"
                                        title={s.task_name}
                                      >
                                        {s.task_name}
                                      </span>
                                    </td>
                                    <td>
                                      <span
                                        className={`status-badge status-${s.status?.toLowerCase().replace(" ", "-") || "default"}`}
                                      >
                                        <span className="status-dot"></span>
                                        {s.status}
                                      </span>
                                    </td>
                                    <td>
                                      <span
                                        className={`priority-badge priority-${s.priority?.toLowerCase().replace(" ", "-") || "default"}`}
                                      >
                                        {s.priority}
                                      </span>
                                    </td>
                                    <td>
                                      {Array.isArray(s.stages) &&
                                      s.stages.length > 0 ? (
                                        <div className="stages-container">
                                          {s.stages.map((stg, i) => (
                                            <div key={i} className="stage-flow">
                                              <span
                                                className={`stage-badge ${stg.completed ? "completed" : "pending"}`}
                                              >
                                                {stg.completed && (
                                                  <span className="check-icon">
                                                    ✓
                                                  </span>
                                                )}
                                                {stg.name}
                                              </span>
                                              {i < s.stages.length - 1 && (
                                                <span className="stage-arrow">
                                                  →
                                                </span>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="no-data">—</span>
                                      )}
                                    </td>
                                    <td>
                                      {s.url ? (
                                        <div
                                          className="url-cell"
                                          onClick={(e) =>
                                            handleCopyToClipboard(s.url, e)
                                          }
                                          title="Click to copy"
                                        >
                                          <span className="url-text">
                                            {s.url}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="no-data">—</span>
                                      )}
                                    </td>
                                    <td>
                                      {assignedEmp ? (
                                        <div className="assignee-cell">
                                          {assignedEmp.profile_pic ? (
                                            <img
                                              src={assignedEmp.profile_pic}
                                              alt={assignedEmp.full_name}
                                              className="assignee-avatar"
                                            />
                                          ) : (
                                            <div className="assignee-avatar-placeholder">
                                              {assignedEmp.full_name
                                                ?.charAt(0)
                                                .toUpperCase()}
                                            </div>
                                          )}
                                          <span className="assignee-name">
                                            {assignedEmp.full_name}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="no-data">—</span>
                                      )}
                                    </td>
                                    <td>
                                      <span className="time-cell">
                                        {calculateTimeTracked(s.time_logs)}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="date-cell">
                                        {formateDate(s.due_date)}
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
                                          to={`/project/subtask/edit/${s._id}`}
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
                                          to={`/subtask/view/${s._id}`}
                                          className="action-btn view-btn"
                                          title="View"
                                        >
                                          <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                          >
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                          </svg>
                                        </Link>
                                      </div>
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
              ))}

              {!loading && projects.length === 0 && (
                <tr>
                  <td
                    colSpan="11"
                    className="text-center py-8 text-gray-400 text-sm"
                  >
                    No projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center flex-wrap gap-1.5 mt-4 py-3">
            <button
              className="px-2 sm:px-3 py-1 rounded border text-xs sm:text-sm disabled:opacity-40"
              onClick={() => fetchProjects(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
            >
              ← Prev
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === pagination.totalPages ||
                  Math.abs(p - pagination.page) <= 1,
              )
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`e-${i}`} className="px-1 text-gray-400 text-sm">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => fetchProjects(p)}
                    disabled={loading}
                    className={`px-2 sm:px-3 py-1 rounded border text-xs sm:text-sm ${p === pagination.page ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-100"}`}
                  >
                    {p}
                  </button>
                ),
              )}

            <button
              className="px-2 sm:px-3 py-1 rounded border text-xs sm:text-sm disabled:opacity-40"
              onClick={() => fetchProjects(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
            >
              Next →
            </button>

            <div className="w-28 ml-2">
              <SearchableSelect
                value={{
                  value: pagination.limit,
                  label: `${pagination.limit}/pg`,
                }}
                onChange={(opt) => {
                  setPagination((p) => ({ ...p, limit: Number(opt.value) }));
                  fetchProjects(1);
                }}
                options={[10, 20, 50, 100].map((n) => ({
                  value: n,
                  label: `${n}/pg`,
                }))}
                isClearable={false}
                menuPlacement="top"
              />
            </div>
          </div>
        )}

        {/* Bulk actions */}
        {selectedTaskIds.length > 0 && (
          <div className="bulk-actions">
            <div
              className="bulk-actions-header"
              style={{ flexWrap: "wrap", gap: "8px" }}
            >
              <span className="bulk-count-main">
                <span className="bulk-count">{selectedTaskIds.length}</span>{" "}
                selected
              </span>
              <div
                className="bulk-controls"
                style={{ flexWrap: "wrap", gap: "6px" }}
              >
                <div className="w-40">
                  <EmployeeSearchableSelect
                    key={selectedStageNames.join(",") || "no-stages"}
                    placeholder="👤 Assign"
                    label={null}
                    isClearable
                    stages={selectedStageNames}
                    value={
                      bulkAssignTo
                        ? {
                            value: bulkAssignTo,
                            label:
                              employees.find((e) => e._id === bulkAssignTo)
                                ?.full_name || "Selected",
                          }
                        : null
                    }
                    onChange={(opt) => setBulkAssignTo(opt ? opt.value : "")}
                    menuPlacement="top"
                  />
                </div>
                <div className="w-40">
                  <SearchableSelect
                    placeholder="⚡ Priority"
                    value={
                      bulkPriority
                        ? { value: bulkPriority, label: bulkPriority }
                        : null
                    }
                    onChange={(opt) => setBulkPriority(opt ? opt.value : "")}
                    options={priorityOptions.map((o) => ({
                      value: o,
                      label: o,
                    }))}
                    menuPlacement="top"
                  />
                </div>
                <button
                  onClick={handleBulkUpdateAll}
                  className="bulk-btn bulk-btn-primary"
                  disabled={!bulkAssignTo && !bulkPriority}
                  style={{ fontSize: "13px" }}
                >
                  ✓ Apply
                </button>
                <button
                  className="bulk-btn bulk-btn-danger"
                  onClick={() => setShowBulkDeleteModal(true)}
                  style={{ fontSize: "13px" }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <Modal
        show={showBulkDeleteModal}
        onHide={() => setShowBulkDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Delete <strong>{selectedTaskIds.length}</strong> selected subtask(s)?
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
