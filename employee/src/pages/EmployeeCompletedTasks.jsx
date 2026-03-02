// EmployeeCompletedTasks.optimized.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import LoadingOverlay from "../components/LoadingOverlay";
import { formatMs, RANGE_OPTIONS, PaginationBar, CustomDateModal } from "../hooks/useEmployeeData";

const API = process.env.REACT_APP_API_URL;

const STAGE_CLASS = {
  "CAD Design": "md-status-cad",
  "SET Design": "md-status-set",
  Delivery: "md-status-delivery",
  Render: "md-status-render",
  QC: "md-status-qc",
};

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
      const { data } = await axios.get(`${API}/api/employee/completed-tasks/${employeeId}?${params}`);
      setProjects(data.projects);
      setSummary(data.summary);
      setPagination({ ...data.pagination, limit });
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Completed Tasks History</h1>
            <p className="text-gray-600">View all tasks you've completed with completion dates</p>
          </div>
        </div>
      </div>

      {/* Filters + Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {RANGE_OPTIONS.map(({ key, label }) => (
            <button key={key}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedRange === key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
              onClick={() => key === "custom" ? setShowCustomModal(true) : setSelectedRange(key)}>
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <img src="/SVG/clipboard.svg" alt="tasks" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tasks Completed</p>
              <p className="text-2xl font-bold text-gray-800">{summary.totalTasks}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Projects</p>
              <p className="text-2xl font-bold text-gray-800">{summary.totalProjects}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <img src="/SVG/time-blue.svg" alt="time" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Time Spent</p>
              <p className="text-2xl font-bold text-gray-800">{formatMs(summary.totalTimeMs)}</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Showing {projects.length} of {pagination.total} projects
          {loading && <span className="ml-2 text-blue-500">↻ Updating…</span>}
        </p>
      </div>

      {/* Projects table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="time-table-table">
            <thead className="ttb-table-row">
              <tr><th></th><th>Project Name</th><th>Tasks Completed</th><th>Total Time Spent</th></tr>
            </thead>
            <tbody>
              {projects.length === 0 && !loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
                    No completed tasks found for the selected period.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <React.Fragment key={project.project_id}>
                    <tr className="time-table-row">
                      <td>
                        <img src="/SVG/arrow.svg" alt="arrow"
                          className={`time-table-toggle-btn ${expandedProjectId === project.project_id ? "rotate-down" : ""}`}
                          onClick={() => setExpandedProjectId(expandedProjectId === project.project_id ? null : project.project_id)}
                          style={{ cursor: "pointer" }} />
                      </td>
                      <td><span style={{ fontWeight: 600 }}>{project.project_name}</span></td>
                      <td>{project.tasks.length}</td>
                      <td>{formatMs(project.totalTimeMs)}</td>
                    </tr>

                    <tr className={`time-table-subtask-row ${expandedProjectId === project.project_id ? "" : "time-table-hidden"}`}>
                      <td colSpan="4">
                        <table className="time-table-subtable time-table-subtable-left">
                          <thead>
                            <tr><th></th><th>Task Name</th><th>Stage Completed</th><th>Completed On</th><th>Time Spent</th></tr>
                          </thead>
                          <tbody>
                            {project.tasks.map((task, i) => (
                              <tr key={i} className="subtask-row">
                                <td></td>
                                <td><span title={task.task_name}>{task.task_name}</span></td>
                                <td>
                                  <span className={`time-table-badge ${STAGE_CLASS[task.stage_name] ?? "md-status-default"}`}
                                    style={{ padding: "6px 12px", borderRadius: 12, fontSize: 12 }}>
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
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between text-sm">
            <span className="text-gray-600">
              {summary.totalTasks} tasks across <span className="font-semibold">{summary.totalProjects}</span> projects
            </span>
            <span className="text-gray-600">
              Total time: <span className="font-semibold">{formatMs(summary.totalTimeMs)}</span>
            </span>
          </div>
        )}

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