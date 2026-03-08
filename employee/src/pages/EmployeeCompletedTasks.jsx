import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import LoadingOverlay from "../components/LoadingOverlay";
import {
  formatMs,
  RANGE_OPTIONS,
  PaginationBar,
  CustomDateModal,
} from "../hooks/useEmployeeData";

const API = process.env.REACT_APP_API_URL;

const STAGE_CLASS = {
  "CAD Design": "md-status-cad",
  "SET Design": "md-status-set",
  Delivery: "md-status-delivery",
  Render: "md-status-render",
  QC: "md-status-qc",
};

/* ─── mobile task card ───────────────────────────────────────────────────── */
const TaskCard = ({ task }) => (
  <div className="px-4 py-3 border-b border-gray-100 last:border-0">
    <div className="flex items-start justify-between gap-2 mb-1.5">
      <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2">{task.task_name}</p>
      <span className={`time-table-badge flex-shrink-0 ${STAGE_CLASS[task.stage_name] ?? "md-status-default"}`}
        style={{ padding: "3px 10px", borderRadius: 10, fontSize: 11, whiteSpace: "nowrap" }}>
        {task.stage_name}
      </span>
    </div>
    <div className="flex items-center gap-4 text-xs text-gray-500">
      <span>
        <span className="text-gray-400">Done: </span>
        {moment(task.completed_at).format("DD/MM/YY")}
        <span className="text-gray-400 ml-1">{moment(task.completed_at).format("hh:mm A")}</span>
      </span>
      <span>
        <span className="text-gray-400">Time: </span>
        <span className="font-medium text-gray-700">{formatMs(task.timeSpentMs)}</span>
      </span>
    </div>
  </div>
);

/* ─── mobile project card ────────────────────────────────────────────────── */
const ProjectMobileCard = ({ project, expanded, onToggle }) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
    {/* project header */}
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
    >
      <div className="min-w-0">
        <p className="font-semibold text-gray-800 text-sm truncate">{project.project_name}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {project.tasks.length} task{project.tasks.length !== 1 ? "s" : ""} · {formatMs(project.totalTimeMs)}
        </p>
      </div>
      <svg
        className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    {/* expanded task list */}
    {expanded && (
      <div className="bg-gray-50 border-t border-gray-100">
        {project.tasks.map((task, i) => <TaskCard key={i} task={task} />)}
      </div>
    )}
  </div>
);

/* ─── main ───────────────────────────────────────────────────────────────── */
const EmployeeCompletedTasks = () => {
  const navigate = useNavigate();
  const employeeId = JSON.parse(localStorage.getItem("employeeUser") ?? "{}")?._id;

  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState({ totalTasks: 0, totalProjects: 0, totalTimeMs: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [selectedRange, setSelectedRange] = useState("all");
  const [customDates, setCustomDates] = useState({ from: "", to: "" });
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [expandedProjectId, setExpandedProjectId] = useState(null);

  const fetchData = useCallback(
    async (page = 1, limit = pagination.limit) => {
      if (!employeeId) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page, limit,
          range: selectedRange,
          ...(selectedRange === "custom" && customDates.from && { from: customDates.from }),
          ...(selectedRange === "custom" && customDates.to && { to: customDates.to }),
        });
        const { data } = await axios.get(`${API}/api/employee/completed-tasks/${employeeId}?${params}`);
        setProjects(data.projects);
        setSummary(data.summary);
        setPagination({ ...data.pagination, limit });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [employeeId, selectedRange, customDates]
  );

  useEffect(() => { fetchData(1, pagination.limit); }, [selectedRange, customDates]);

  if (loading && !projects.length) return <LoadingOverlay />;

  const toggleProject = (id) =>
    setExpandedProjectId((prev) => (prev === id ? null : id));

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* ── Header ── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 sm:px-6 py-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <button
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0"
            onClick={() => navigate(-1)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-semibold text-gray-800">Completed Tasks History</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden xs:block">
              View all tasks you've completed with completion dates
            </p>
          </div>
        </div>
      </div>

      {/* ── Filters + Stats ── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        {/* Range buttons — scrollable on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 sm:mb-6 scrollbar-hide">
          {RANGE_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => key === "custom" ? setShowCustomModal(true) : setSelectedRange(key)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium flex-shrink-0 transition-colors ${selectedRange === key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Stat cards — 1 col on xs, 3 on md */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { bg: "bg-purple-100", icon: <img src="/SVG/clipboard.svg" alt="tasks" className="w-5 h-5 sm:w-6 sm:h-6" />, label: "Tasks Completed", value: summary.totalTasks },
            {
              bg: "bg-blue-100",
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              ),
              label: "Projects",
              value: summary.totalProjects,
            },
            { bg: "bg-yellow-100", icon: <img src="/SVG/time-blue.svg" alt="time" className="w-5 h-5 sm:w-6 sm:h-6" />, label: "Total Time Spent", value: formatMs(summary.totalTimeMs) },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-sm">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${s.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">{s.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs sm:text-sm text-gray-400 mt-3 sm:mt-4">
          Showing {projects.length} of {pagination.total} projects
          {loading && <span className="ml-2 text-blue-500 animate-pulse">↻ Updating…</span>}
        </p>
      </div>

      {/* ── Mobile Project Cards ── */}
      <div className="md:hidden space-y-3 mb-4">
        {projects.length === 0 && !loading ? (
          <div className="bg-white rounded-xl border border-gray-200 py-14 text-center shadow-sm">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm text-gray-400 font-medium">No completed tasks found</p>
          </div>
        ) : (
          projects.map((project) => (
            <ProjectMobileCard
              key={project.project_id}
              project={project}
              expanded={expandedProjectId === project.project_id}
              onToggle={() => toggleProject(project.project_id)}
            />
          ))
        )}
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="time-table-table">
            <thead className="ttb-table-row">
              <tr>
                <th></th>
                <th>Project Name</th>
                <th>Tasks Completed</th>
                <th>Total Time Spent</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 && !loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: 48, color: "#9ca3af" }}>
                    No completed tasks found for the selected period.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <React.Fragment key={project.project_id}>
                    <tr className="time-table-row">
                      <td>
                        <img
                          src="/SVG/arrow.svg"
                          alt="arrow"
                          className={`time-table-toggle-btn ${expandedProjectId === project.project_id ? "rotate-down" : ""}`}
                          onClick={() => toggleProject(project.project_id)}
                          style={{ cursor: "pointer" }}
                        />
                      </td>
                      <td><span style={{ fontWeight: 600 }}>{project.project_name}</span></td>
                      <td>{project.tasks.length}</td>
                      <td>{formatMs(project.totalTimeMs)}</td>
                    </tr>

                    <tr className={`time-table-subtask-row ${expandedProjectId === project.project_id ? "" : "time-table-hidden"}`}>
                      <td colSpan="4">
                        <table className="time-table-subtable time-table-subtable-left">
                          <thead>
                            <tr>
                              <th></th>
                              <th>Task Name</th>
                              <th>Stage Completed</th>
                              <th>Completed On</th>
                              <th>Time Spent</th>
                            </tr>
                          </thead>
                          <tbody>
                            {project.tasks.map((task, i) => (
                              <tr key={i} className="subtask-row">
                                <td></td>
                                <td><span title={task.task_name}>{task.task_name}</span></td>
                                <td>
                                  <span
                                    className={`time-table-badge ${STAGE_CLASS[task.stage_name] ?? "md-status-default"}`}
                                    style={{ padding: "6px 12px", borderRadius: 12, fontSize: 12 }}
                                  >
                                    {task.stage_name}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span>{moment(task.completed_at).format("DD/MM/YYYY")}</span>
                                    <span style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                                      {moment(task.completed_at).format("hh:mm A")}
                                    </span>
                                  </div>
                                </td>
                                <td>{formatMs(task.timeSpentMs)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {projects.length > 0 && (
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap justify-between gap-2 text-sm text-gray-500">
            <span>{summary.totalTasks} tasks across <span className="font-semibold text-gray-700">{summary.totalProjects}</span> projects</span>
            <span>Total time: <span className="font-semibold text-gray-700">{formatMs(summary.totalTimeMs)}</span></span>
          </div>
        )}

        <PaginationBar
          pagination={pagination}
          onPageChange={(p) => fetchData(p, pagination.limit)}
          onLimitChange={(l) => fetchData(1, l)}
          loading={loading}
        />
      </div>

      {/* Mobile pagination */}
      <div className="md:hidden">
        <PaginationBar
          pagination={pagination}
          onPageChange={(p) => fetchData(p, pagination.limit)}
          onLimitChange={(l) => fetchData(1, l)}
          loading={loading}
        />
      </div>

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

export default EmployeeCompletedTasks;