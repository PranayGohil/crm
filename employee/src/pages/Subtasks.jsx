// Replaces: fetching ALL projects via /api/project/manager/:id then filtering in JS
// Now: server-side pagination + filtering via getProjectsForReportingManager controller
// Route: GET /api/project/manager/:managerId?search=&status=&priority=&stage=&employee=&page=&limit=

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Modal, Button } from "react-bootstrap";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { stageOptions, priorityOptions, statusOptions } from "../options";
import LoadingOverlay from "../components/LoadingOverlay";

dayjs.extend(duration);

const API = process.env.REACT_APP_API_URL;

function useDebounce(value, delay = 400) {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return d;
}

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, "0")} ${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
};

const getRemainingDays = (dueDate) => {
  if (!dueDate) return "-";
  const diff = Math.ceil((new Date(dueDate) - new Date()) / 86400000);
  return diff >= 0 ? `${diff} days` : "Overdue";
};

const calcProjectTime = (subtasks = []) => {
  let ms = 0;
  subtasks.forEach((s) => (s.time_logs ?? []).forEach((log) => {
    ms += dayjs(log.end_time ?? undefined).diff(dayjs(log.start_time));
  }));
  const dur = dayjs.duration(ms);
  return `${dur.hours()}h ${dur.minutes()}m ${dur.seconds()}s`;
};

const calcTimeTracked = (logs = []) => {
  let ms = 0;
  logs.forEach((log) => { ms += dayjs(log.end_time ?? undefined).diff(dayjs(log.start_time)); });
  const dur = dayjs.duration(ms);
  return `${dur.hours()}h ${dur.minutes()}m ${dur.seconds()}s`;
};

const Pagination = ({ pagination, onPageChange, onLimitChange, loading }) => {
  const { page, totalPages, limit } = pagination;
  if (totalPages <= 1 && limit === 20) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
    .reduce((acc, p, i, arr) => {
      if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "16px 0", flexWrap: "wrap" }}>
      <button className="px-3 py-1 rounded border text-sm"
        onClick={() => onPageChange(page - 1)} disabled={page <= 1 || loading}>← Prev</button>
      {pages.map((p, i) =>
        p === "…" ? <span key={`e${i}`} style={{ color: "#aaa" }}>…</span> : (
          <button key={p} onClick={() => onPageChange(p)} disabled={loading}
            style={{
              padding: "4px 12px", borderRadius: 4, border: "1px solid #ddd",
              background: p === page ? "#2563eb" : "#fff", color: p === page ? "#fff" : "#374151", cursor: "pointer"
            }}>
            {p}
          </button>
        )
      )}
      <button className="px-3 py-1 rounded border text-sm"
        onClick={() => onPageChange(page + 1)} disabled={page >= totalPages || loading}>Next →</button>
      <select style={{ marginLeft: 16, border: "1px solid #ddd", borderRadius: 4, padding: "4px 8px", fontSize: 13 }}
        value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}>
        {[10, 20, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
      </select>
    </div>
  );
};

const SortIcon = ({ columnKey, sortConfig }) => {
  const active = sortConfig.key === columnKey;
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ marginLeft: 4, opacity: active ? 1 : 0.3 }}>
      {!active || sortConfig.direction === "desc"
        ? <path d="M12 5v14M5 12l7 7 7-7" />
        : <path d="M12 19V5M5 12l7-7 7 7" />}
    </svg>
  );
};

const naturalSort = (a, b) => {
  const re = /(\d+)|(\D+)/g;
  const ap = a.match(re) ?? [], bp = b.match(re) ?? [];
  for (let i = 0; i < Math.max(ap.length, bp.length); i++) {
    const av = ap[i] ?? "", bv = bp[i] ?? "";
    if (/^\d+$/.test(av) && /^\d+$/.test(bv)) { const d = parseInt(av) - parseInt(bv); if (d) return d; }
    else { const d = av.localeCompare(bv); if (d) return d; }
  }
  return 0;
};

const getSortedSubtasks = (subtasks, sortConfig) => {
  if (!sortConfig.key || !subtasks) return subtasks;
  return [...subtasks].sort((a, b) => {
    if (sortConfig.key === "name") {
      const r = naturalSort((a.task_name ?? "").toLowerCase(), (b.task_name ?? "").toLowerCase());
      return sortConfig.direction === "asc" ? r : -r;
    }
    if (sortConfig.key === "dueDate") {
      const da = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const db = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      return sortConfig.direction === "asc" ? da - db : db - da;
    }
    return 0;
  });
};

// ─── main ─────────────────────────────────────────────────────────────────────
const Subtasks = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("employeeUser") ?? "{}");
  const managerId = user?._id;

  // reference data loaded once
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);

  // server-driven
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // filters
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    client: "", status: "", priority: "", stage: "", employee: "",
  });
  const debouncedSearch = useDebounce(searchInput);

  // ui
  const [openRow, setOpenRow] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [bulkAssignTo, setBulkAssignTo] = useState("");
  const [bulkPriority, setBulkPriority] = useState("");
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // ── load reference data once ─────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/client/get-all`),
      axios.get(`${API}/api/employee/get-all`),
    ]).then(([cl, em]) => {
      setClients(cl.data);
      // Only show team employees in dropdown
      setEmployees(em.data.filter((e) => e.reporting_manager?._id === managerId));
    }).catch(console.error);
  }, [managerId]);

  // ── fetch projects ────────────────────────────────────────────────────
  const fetchProjects = useCallback(async (page = 1, limit = pagination.limit) => {
    if (!managerId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.stage && { stage: filters.stage }),
        ...(filters.employee && { employee: filters.employee }),
      });
      const { data } = await axios.get(`${API}/api/project/manager/${managerId}?${params}`);
      setProjects(data.projects);
      setPagination({ ...data.pagination, limit });
      setOpenRow(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managerId, debouncedSearch, filters]);

  useEffect(() => { fetchProjects(1, pagination.limit); }, [debouncedSearch, filters]);

  const clientIdToName = useMemo(() => {
    const map = {};
    clients.forEach((c) => { map[c._id] = c.full_name; });
    return map;
  }, [clients]);

  // Compute stats from loaded page data
  const pageStats = useMemo(() => {
    let totalTasks = 0;
    const byStage = {};
    projects.forEach((p) => {
      (p.subtasks ?? []).forEach((s) => {
        totalTasks++;
        (s.stages ?? []).forEach((stg, idx) => {
          if (idx >= (s.current_stage_index ?? 0) && !stg.completed) {
            byStage[stg.name] = (byStage[stg.name] || 0) + 1;
          }
        });
      });
    });
    return { totalTasks, byStage };
  }, [projects]);

  const handleSort = (key) => setSortConfig((p) => ({
    key, direction: p.key === key && p.direction === "asc" ? "desc" : "asc",
  }));

  const handleResetFilters = () => {
    setSearchInput("");
    setFilters({ client: "", status: "", priority: "", stage: "", employee: "" });
  };

  const handleBulkUpdate = async () => {
    if (!selectedTaskIds.length) return;
    const update = {};
    if (bulkAssignTo) update.assign_to = bulkAssignTo;
    if (bulkPriority) update.priority = bulkPriority;
    if (!Object.keys(update).length) return toast.info("No changes selected.");
    setLoading(true);
    try {
      await axios.put(`${API}/api/subtask/bulk-update`, { ids: selectedTaskIds, update });
      toast.success("Changes applied!");
      setBulkAssignTo(""); setBulkPriority(""); setSelectedTaskIds([]);
      fetchProjects(pagination.page, pagination.limit);
    } catch { toast.error("Failed."); }
    finally { setLoading(false); }
  };

  const handleBulkDelete = async () => {
    if (!selectedTaskIds.length) return;
    setLoading(true);
    try {
      await axios.post(`${API}/api/subtask/bulk-delete`, { ids: selectedTaskIds });
      toast.success("Deleted!");
      setSelectedTaskIds([]); setShowBulkDeleteModal(false);
      fetchProjects(pagination.page, pagination.limit);
    } catch { toast.error("Delete failed."); }
    finally { setLoading(false); }
  };

  const handleCopyUrl = (url, e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.ctrlKey || e.metaKey) { window.open(url, "_blank", "noopener,noreferrer"); return; }
    navigator.clipboard.writeText(url)
      .then(() => toast.success("URL copied!"))
      .catch(() => toast.error("Copy failed."));
  };

  if (loading && !projects.length) return <LoadingOverlay />;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <section className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-button" onClick={() => navigate(-1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <h1 className="header-title">All Subtasks</h1>
          </div>

          {/* Stats card */}
          <div className="w-[500px] card p-3 shadow border-0">
            <div className="md-common-para-icon md-para-icon-tasks">
              <span>Subtasks</span>
              <div className="md-common-icon">
                <img src="SVG/true-green.svg" alt="total tasks" />
              </div>
            </div>
            <div className="md-total-project-number">
              <span className="md-total-card-number">{pageStats.totalTasks}</span>
              <span className="md-total-card-text">on this page</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(pageStats.byStage).map(([stage, count]) => (
                <div key={stage} className={`px-3 py-1 text-sm font-medium rounded-full ${stage === "CAD Design" ? "bg-blue-100 text-blue-800"
                  : stage === "SET Design" ? "bg-green-100 text-green-800"
                    : stage === "Render" ? "bg-purple-100 text-purple-800"
                      : stage === "QC" ? "bg-cyan-100 text-cyan-800"
                        : "bg-gray-100 text-gray-800"
                  }`}>
                  {count} {stage} Remaining
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="controls-section">
        <div className="controls-left mb-3 flex justify-between flex-wrap gap-3">
          <div className="search-container flex items-center gap-3">
            <input type="text" placeholder="Search project name…"
              value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              className="search-input" />
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <div className="filter-controls flex items-center gap-3 flex-wrap">
            <select value={filters.status}
              onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
              className="filter-select">
              <option value="">All Status</option>
              {statusOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>

            <select value={filters.priority}
              onChange={(e) => setFilters((p) => ({ ...p, priority: e.target.value }))}
              className="filter-select">
              <option value="">All Priority</option>
              {priorityOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>

            <select value={filters.stage}
              onChange={(e) => setFilters((p) => ({ ...p, stage: e.target.value }))}
              className="filter-select">
              <option value="">All Stages</option>
              {stageOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>

            <select value={filters.employee}
              onChange={(e) => setFilters((p) => ({ ...p, employee: e.target.value }))}
              className="filter-select">
              <option value="">All Team Members</option>
              {employees.map((e) => <option key={e._id} value={e._id}>{e.full_name}</option>)}
            </select>

            <button className="reset-button" onClick={handleResetFilters}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              Reset
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-2">
          Showing {projects.length} of {pagination.total} projects
          {loading && <span className="ml-2 text-blue-500">↻ loading…</span>}
        </p>
      </section>

      {/* Table */}
      <section className="table-container">
        <div className="table-wrapper overflow-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="expand-column"></th>
                <th>Project Name</th><th>Client</th><th>Status</th>
                <th>Subtasks</th><th>Total Time</th><th>Priority</th>
                <th>Start Date</th><th>End Date</th><th>Remaining</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, idx) => (
                <React.Fragment key={project._id}>
                  <tr className="project-row">
                    <td>
                      <button
                        className={`expand-button ${openRow === idx ? "expanded" : ""}`}
                        onClick={() => setOpenRow(openRow === idx ? null : idx)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </button>
                    </td>
                    <td><span className="project-name-text" title={project.project_name}>{project.project_name}</span></td>
                    <td><span className="client-name">{clientIdToName[project.client_id] || "N/A"}</span></td>
                    <td>
                      <span className={`status-badge status-${project.status?.toLowerCase().replace(" ", "-") || "default"}`}>
                        <span className="status-dot" />{project.status}
                      </span>
                    </td>
                    <td><span className="subtask-count">{project.subtasks?.length ?? 0}</span></td>
                    <td><span className="time-cell">{calcProjectTime(project.subtasks)}</span></td>
                    <td>
                      <span className={`priority-badge priority-${project.priority?.toLowerCase().replace(" ", "-") || "default"}`}>
                        {project.priority}
                      </span>
                    </td>
                    <td><span className="date-cell">{formatDate(project.assign_date)}</span></td>
                    <td><span className="date-cell">{formatDate(project.due_date)}</span></td>
                    <td><span className="remaining-time">{getRemainingDays(project.due_date)}</span></td>
                    <td>
                      <Link to={`/project/details/${project._id}`} className="action-btn view-btn" title="View">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </Link>
                    </td>
                  </tr>

                  {openRow === idx && (
                    <tr className="subtasks-expanded-row">
                      <td colSpan="11" className="subtasks-container">
                        <div className="subtasks-table-wrapper">
                          <table className="subtasks-table w-100">
                            <thead>
                              <tr>
                                <th className="checkbox-column">
                                  <input type="checkbox" className="checkbox-input"
                                    checked={project.subtasks?.every((s) => selectedTaskIds.includes(s._id)) && project.subtasks?.length > 0}
                                    onChange={(e) => {
                                      const ids = project.subtasks?.map((s) => s._id) ?? [];
                                      setSelectedTaskIds((prev) =>
                                        e.target.checked ? [...new Set([...prev, ...ids])] : prev.filter((id) => !ids.includes(id))
                                      );
                                    }} />
                                </th>
                                <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
                                  <div style={{ display: "flex", alignItems: "center" }}>
                                    Subtask Name <SortIcon columnKey="name" sortConfig={sortConfig} />
                                  </div>
                                </th>
                                <th>Status</th><th>Priority</th><th>Stages</th><th>URL</th>
                                <th>Assigned To</th><th>Time Tracked</th>
                                <th onClick={() => handleSort("dueDate")} style={{ cursor: "pointer" }}>
                                  <div style={{ display: "flex", alignItems: "center" }}>
                                    Due Date <SortIcon columnKey="dueDate" sortConfig={sortConfig} />
                                  </div>
                                </th>
                                <th>Remaining</th><th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getSortedSubtasks(project.subtasks, sortConfig).map((s) => {
                                const assignedEmp = employees.find((e) => e._id === s.assign_to?.toString());
                                return (
                                  <tr key={s._id}>
                                    <td>
                                      <input type="checkbox" className="checkbox-input"
                                        checked={selectedTaskIds.includes(s._id)}
                                        onChange={(e) => setSelectedTaskIds((prev) =>
                                          e.target.checked ? [...prev, s._id] : prev.filter((id) => id !== s._id)
                                        )} />
                                    </td>
                                    <td><span className="task-name-text" title={s.task_name}>{s.task_name}</span></td>
                                    <td>
                                      <span className={`status-badge status-${s.status?.toLowerCase().replace(" ", "-") || "default"}`}>
                                        <span className="status-dot" />{s.status}
                                      </span>
                                    </td>
                                    <td>
                                      <span className={`priority-badge priority-${s.priority?.toLowerCase().replace(" ", "-") || "default"}`}>
                                        {s.priority}
                                      </span>
                                    </td>
                                    <td>
                                      {Array.isArray(s.stages) && s.stages.length > 0 ? (
                                        <div className="stages-container">
                                          {s.stages.map((stg, i) => (
                                            <div key={i} className="stage-flow">
                                              <span className={`stage-badge ${stg.completed ? "completed" : "pending"}`}>
                                                {stg.completed && <span className="check-icon">✓</span>}
                                                {stg.name}
                                              </span>
                                              {i < s.stages.length - 1 && <span className="stage-arrow">→</span>}
                                            </div>
                                          ))}
                                        </div>
                                      ) : <span className="no-data">No stages</span>}
                                    </td>
                                    <td>
                                      {s.url ? (
                                        <div className="url-cell" onClick={(e) => handleCopyUrl(s.url, e)}
                                          title="Click to copy • Ctrl+Click to open">
                                          <span className="url-text">{s.url}</span>
                                        </div>
                                      ) : <span className="no-data">No URL</span>}
                                    </td>
                                    <td>
                                      {assignedEmp ? (
                                        <div className="assignee-cell">
                                          {assignedEmp.profile_pic
                                            ? <img src={assignedEmp.profile_pic} alt={assignedEmp.full_name} className="assignee-avatar" />
                                            : <div className="assignee-avatar-placeholder">{assignedEmp.full_name?.charAt(0).toUpperCase()}</div>}
                                          <span className="assignee-name">{assignedEmp.full_name}</span>
                                        </div>
                                      ) : <span className="no-data">Unassigned</span>}
                                    </td>
                                    <td><span className="time-cell">{calcTimeTracked(s.time_logs)}</span></td>
                                    <td><span className="date-cell">{formatDate(s.due_date)}</span></td>
                                    <td><span className="remaining-time">{getRemainingDays(s.due_date)}</span></td>
                                    <td>
                                      <Link to={`/subtask/view/${s._id}`} className="action-btn view-btn" title="View">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                          <circle cx="12" cy="12" r="3" />
                                        </svg>
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
              ))}
              {!loading && projects.length === 0 && (
                <tr><td colSpan="11" className="text-center py-8 text-gray-400">No projects found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination pagination={pagination}
          onPageChange={(p) => fetchProjects(p, pagination.limit)}
          onLimitChange={(l) => fetchProjects(1, l)} loading={loading} />

        {selectedTaskIds.length > 0 && (
          <div className="bulk-actions">
            <div className="bulk-actions-header">
              <span className="bulk-count-main">
                <span className="bulk-count">{selectedTaskIds.length}</span> items selected
              </span>
              <div className="bulk-controls">
                <select value={bulkAssignTo} onChange={(e) => setBulkAssignTo(e.target.value)}
                  className="filter-select" style={{ maxWidth: 150 }}>
                  <option value="">👤 Assign To</option>
                  <option key={user._id} value={user._id}>{user.full_name}</option>
                  {employees.map((e) => <option key={e._id} value={e._id}>{e.full_name}</option>)}
                </select>
                <select value={bulkPriority} onChange={(e) => setBulkPriority(e.target.value)}
                  className="filter-select" style={{ maxWidth: 150 }}>
                  <option value="">⚡ Priority</option>
                  {priorityOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <button onClick={handleBulkUpdate} className="bulk-btn bulk-btn-primary"
                  disabled={!bulkAssignTo && !bulkPriority}>✓ Apply</button>
                <button className="bulk-btn bulk-btn-danger"
                  onClick={() => setShowBulkDeleteModal(true)}>🗑️ Delete</button>
              </div>
            </div>
          </div>
        )}
      </section>

      <Modal show={showBulkDeleteModal} onHide={() => setShowBulkDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
        <Modal.Body>Delete <strong>{selectedTaskIds.length}</strong> selected subtask(s)?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleBulkDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Subtasks;