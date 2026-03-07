import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingOverlay from "../../components/admin/LoadingOverlay";

/* ─── helpers ────────────────────────────────────────────────────────────── */
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return `${String(date.getDate()).padStart(2, "0")} ${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
};

const getDaysRemaining = (dueDateStr) => {
  if (!dueDateStr) return null;
  const diff = new Date(dueDateStr) - new Date();
  return Math.max(Math.ceil(diff / 86400000), 0);
};

const daysBadge = (days) => {
  if (days === null) return { bg: "bg-gray-50 border-gray-200 text-gray-500", dot: "bg-gray-400" };
  if (days < 7) return { bg: "bg-red-50 border-red-200 text-red-700", dot: "bg-red-500" };
  if (days < 14) return { bg: "bg-yellow-50 border-yellow-200 text-yellow-700", dot: "bg-yellow-500" };
  return { bg: "bg-green-50 border-green-200 text-green-700", dot: "bg-green-500" };
};

const statusBadgeClass = (status) => {
  const s = status?.toLowerCase().replace(" ", "-") || "default";
  return `status-badge status-${s}`;
};

/* ─── mobile card ────────────────────────────────────────────────────────── */
const TaskCard = ({ task }) => {
  const daysLeft = getDaysRemaining(task.due_date);
  const badge = daysBadge(daysLeft);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-sm">
      {/* Project + status */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-gray-400 mb-0.5">Project</p>
          <p className="font-semibold text-gray-800 text-sm truncate" title={task.project_id?.project_name}>
            {task.project_id?.project_name || "N/A"}
          </p>
        </div>
        <span className={statusBadgeClass(task.status)}>
          <span className="status-dot"></span>
          {task.status || "N/A"}
        </span>
      </div>

      {/* Task name */}
      <div>
        <p className="text-xs text-gray-400 mb-0.5">Task</p>
        <p className="text-sm text-gray-700 font-medium truncate" title={task.task_name}>{task.task_name || "N/A"}</p>
      </div>

      {/* Dates row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Task Due</p>
          <p className="text-xs font-medium text-gray-700">{formatDate(task.due_date)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Project Due</p>
          <p className="text-xs font-medium text-gray-700">{formatDate(task.project_id?.due_date)}</p>
        </div>
      </div>

      {/* Assignee + days */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {task.assign_to?.profile_pic ? (
            <img src={task.assign_to.profile_pic} alt={task.assign_to?.full_name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="assignee-avatar-placeholder w-7 h-7 flex-shrink-0">
              {task.assign_to?.full_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
          <span className="text-xs text-gray-600 truncate">{task.assign_to?.full_name || "Unassigned"}</span>
        </div>

        {daysLeft !== null ? (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${badge.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
            <span className="font-bold">{daysLeft}</span>
            <span className="font-medium">{daysLeft === 1 ? "day" : "days"}</span>
          </span>
        ) : (
          <span className="text-xs text-gray-400">N/A</span>
        )}
      </div>
    </div>
  );
};

/* ─── main ───────────────────────────────────────────────────────────────── */
const UpcomingDueDatesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dueTasks, setDueTasks] = useState([]);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/statistics/upcoming-due-dates`)
      .then((res) => {
        const sorted = [...res.data].sort((a, b) => {
          const dA = a.project_id?.due_date ? new Date(a.project_id.due_date) : new Date(0);
          const dB = b.project_id?.due_date ? new Date(b.project_id.due_date) : new Date(0);
          return dA - dB;
        });
        setDueTasks(sorted);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingOverlay />;

  const critical = dueTasks.filter((t) => { const d = getDaysRemaining(t.due_date); return d !== null && d < 7; }).length;
  const warning = dueTasks.filter((t) => { const d = getDaysRemaining(t.due_date); return d !== null && d >= 7 && d < 14; }).length;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <section className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-button" onClick={() => navigate("/")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <h1 className="header-title">Upcoming Due Dates</h1>
          </div>
        </div>
      </section>

      {/* Summary strip */}
      <section className="px-3 sm:px-4 py-3 sm:py-4">
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-4 sm:items-center">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center sm:text-left sm:flex sm:items-center sm:gap-3 sm:px-4">
            <p className="text-xs text-gray-500 sm:hidden">Total</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">{dueTasks.length}</p>
            <p className="text-xs text-gray-500 hidden sm:block">Upcoming Tasks</p>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-200 shadow-sm p-3 text-center sm:text-left sm:flex sm:items-center sm:gap-3 sm:px-4">
            <p className="text-xs text-red-500 sm:hidden">Critical</p>
            <p className="text-xl sm:text-2xl font-bold text-red-700">{critical}</p>
            <p className="text-xs text-red-500 hidden sm:block">&lt; 7 Days</p>
          </div>
          <div className="bg-yellow-50 rounded-xl border border-yellow-200 shadow-sm p-3 text-center sm:text-left sm:flex sm:items-center sm:gap-3 sm:px-4">
            <p className="text-xs text-yellow-600 sm:hidden">Warning</p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-700">{warning}</p>
            <p className="text-xs text-yellow-600 hidden sm:block">&lt; 14 Days</p>
          </div>
        </div>
      </section>

      {/* ── Mobile Cards ── */}
      <section className="md:hidden px-3 pb-4 space-y-3">
        {dueTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p className="text-sm font-medium">No upcoming due tasks found</p>
          </div>
        ) : (
          dueTasks.map((task, i) => <TaskCard key={i} task={task} />)
        )}
      </section>

      {/* ── Desktop Table ── */}
      <section className="table-container hidden md:block">
        <div style={{ overflow: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Task Name</th>
                <th>Task Due Date</th>
                <th>Project Due Date</th>
                <th>Assigned To</th>
                <th>Remaining Days</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dueTasks.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", color: "#9ca3af" }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <p style={{ margin: 0, fontWeight: 500 }}>No upcoming due tasks found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                dueTasks.map((task, index) => {
                  const daysLeft = getDaysRemaining(task.due_date);
                  const badge = daysBadge(daysLeft);

                  return (
                    <tr key={index}>
                      <td>
                        <span className="project-name-text" title={task.project_id?.project_name}>
                          {task.project_id?.project_name || "N/A"}
                        </span>
                      </td>
                      <td>
                        <span className="task-name-text" title={task.task_name}>{task.task_name || "N/A"}</span>
                      </td>
                      <td><span className="date-cell">{formatDate(task.due_date)}</span></td>
                      <td><span className="date-cell">{formatDate(task.project_id?.due_date)}</span></td>
                      <td>
                        <div className="assignee-cell">
                          {task.assign_to?.profile_pic ? (
                            <img src={task.assign_to.profile_pic} alt={task.assign_to?.full_name} className="assignee-avatar" />
                          ) : (
                            <div className="assignee-avatar-placeholder">
                              {task.assign_to?.full_name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                          )}
                          <span className="assignee-name">{task.assign_to?.full_name || "Unassigned"}</span>
                        </div>
                      </td>
                      <td>
                        {daysLeft !== null ? (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${badge.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${badge.dot}`}></span>
                            <span className="font-bold text-sm">{daysLeft}</span>
                            <span>{daysLeft === 1 ? "Day" : "Days"} Left</span>
                          </span>
                        ) : (
                          <span className="no-data">N/A</span>
                        )}
                      </td>
                      <td>
                        <span className={statusBadgeClass(task.status)}>
                          <span className="status-dot"></span>
                          {task.status || "N/A"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Summary footer (desktop only) */}
        {dueTasks.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-200 px-5 py-4">
            <div className="flex flex-wrap gap-6 items-center justify-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">Total Tasks:</span>
                <span className="text-base font-bold px-3 py-1 rounded-xl bg-gray-200 text-gray-700">{dueTasks.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">Critical (&lt; 7 days):</span>
                <span className="text-base font-bold px-3 py-1 rounded-xl bg-red-50 text-red-600 border border-red-200">{critical}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">Warning (&lt; 14 days):</span>
                <span className="text-base font-bold px-3 py-1 rounded-xl bg-yellow-50 text-yellow-700 border border-yellow-200">{warning}</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default UpcomingDueDatesPage;