// EmployeeCompletedTasks.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { Modal, Button } from "react-bootstrap";
import LoadingOverlay from "../components/LoadingOverlay";

const EmployeeCompletedTasks = () => {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("employeeUser");
  const employeeId = storedUser ? JSON.parse(storedUser)._id : null;

  const [loading, setLoading] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All Time");
  const [customDateRange, setCustomDateRange] = useState({
    from: null,
    to: null,
  });
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [expandedProjectId, setExpandedProjectId] = useState(null);

  useEffect(() => {
    const fetchCompletedTasks = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/employee/completed-tasks/${employeeId}`
        );
        setCompletedTasks(response.data);
        console.log("Completed tasks:", response.data);
      } catch (error) {
        console.error("Error fetching completed tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    if (employeeId) fetchCompletedTasks();
  }, [employeeId]);

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
      case "Custom": {
        if (customDateRange.from && customDateRange.to) {
          const from = moment(customDateRange.from);
          const to = moment(customDateRange.to).endOf("day");
          return date.isBetween(from, to, null, "[]");
        }
        return false;
      }
      case "All Time":
      default:
        return true;
    }
  };

  const toggleTable = (projectId) => {
    setExpandedProjectId(expandedProjectId === projectId ? null : projectId);
  };

  // Filter tasks by completion date
  const filteredTasks = completedTasks.filter((task) =>
    isWithinFilter(task.completed_at)
  );

  // Group by project
  const groupedByProject = filteredTasks.reduce((acc, task) => {
    const projectId = task.project_id;
    const projectName = task.project_name;

    if (!acc[projectId]) {
      acc[projectId] = {
        project_id: projectId,
        project_name: projectName,
        tasks: [],
        totalTimeSeconds: 0,
      };
    }

    acc[projectId].tasks.push(task);
    acc[projectId].totalTimeSeconds += task.timeSpentSeconds || 0;

    return acc;
  }, {});

  const projects = Object.values(groupedByProject);

  // Calculate summary
  const totalTimeSpent = filteredTasks.reduce((acc, task) => {
    return acc + (task.timeSpentSeconds || 0);
  }, 0);

  const duration = moment.duration(totalTimeSpent, "seconds");
  const days = Math.floor(duration.asDays());
  const hours = duration.hours();
  const minutes = duration.minutes();
  const totalTimeFormatted = `${days}d ${hours}h ${minutes}m`;

  if (loading) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => navigate(-1)}
            >
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
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                Completed Tasks History
              </h1>
              <p className="text-gray-600">
                View all tasks you've completed with completion dates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-2">
              {["All Time", "Today", "This Week", "This Month", "Custom"].map(
                (label) => (
                  <button
                    key={label}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      selectedFilter === label
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
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
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <img src="/SVG/clipboard.svg" alt="tasks" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tasks Completed</p>
              <p className="text-2xl font-bold text-gray-800">
                {filteredTasks.length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Projects</p>
              <p className="text-2xl font-bold text-gray-800">
                {projects.length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <img src="/SVG/time-blue.svg" alt="time" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Time Spent</p>
              <p className="text-2xl font-bold text-gray-800">
                {totalTimeFormatted}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
              {projects.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    <div style={{ color: "#9ca3af" }}>
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ margin: "0 auto 16px", display: "block" }}
                      >
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </svg>
                      No completed tasks found for the selected period
                    </div>
                  </td>
                </tr>
              ) : (
                projects.map((project) => {
                  const projectDuration = moment.duration(
                    project.totalTimeSeconds,
                    "seconds"
                  );
                  const projectTimeFormatted = `${Math.floor(
                    projectDuration.asDays()
                  )}d ${projectDuration.hours()}h ${projectDuration.minutes()}m ${projectDuration.seconds()}s`;

                  return (
                    <React.Fragment key={project.project_id}>
                      <tr className="time-table-row">
                        <td>
                          <img
                            src="/SVG/arrow.svg"
                            alt="arrow"
                            className={`time-table-toggle-btn ${
                              expandedProjectId === project.project_id
                                ? "rotate-down"
                                : ""
                            }`}
                            onClick={() => toggleTable(project.project_id)}
                            style={{ cursor: "pointer" }}
                          />
                        </td>
                        <td>
                          <span style={{ fontWeight: "600" }}>
                            {project.project_name}
                          </span>
                        </td>
                        <td>{project.tasks.length}</td>
                        <td>{projectTimeFormatted}</td>
                      </tr>

                      {/* Subtasks Row */}
                      <tr
                        className={`time-table-subtask-row ${
                          expandedProjectId === project.project_id
                            ? ""
                            : "time-table-hidden"
                        }`}
                      >
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
                              {project.tasks.map((task, index) => (
                                <tr key={index} className="subtask-row">
                                  <td></td>
                                  <td>
                                    <span title={task.task_name}>
                                      {task.task_name}
                                    </span>
                                  </td>
                                  <td>
                                    <span
                                      className={`time-table-badge ${
                                        task.stage_name === "CAD Design"
                                          ? "md-status-cad"
                                          : task.stage_name === "SET Design"
                                          ? "md-status-set"
                                          : task.stage_name === "Delivery"
                                          ? "md-status-delivery"
                                          : task.stage_name === "Render"
                                          ? "md-status-render"
                                          : task.stage_name === "QC"
                                          ? "md-status-qc"
                                          : "md-status-default"
                                      }`}
                                      style={{
                                        padding: "6px 12px",
                                        borderRadius: "12px",
                                        fontSize: "12px",
                                      }}
                                    >
                                      {task.stage_name}
                                    </span>
                                  </td>
                                  <td>
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                      }}
                                    >
                                      <span>
                                        {moment(task.completed_at).format(
                                          "DD/MM/YYYY"
                                        )}
                                      </span>
                                      <span
                                        style={{
                                          fontSize: "12px",
                                          color: "#9ca3af",
                                          marginTop: "2px",
                                        }}
                                      >
                                        {moment(task.completed_at).format(
                                          "hh:mm A"
                                        )}
                                      </span>
                                    </div>
                                  </td>
                                  <td>
                                    <span>{task.timeSpent}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        {projects.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <div className="text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-800">
                  {filteredTasks.length}
                </span>{" "}
                completed tasks across{" "}
                <span className="font-semibold text-gray-800">
                  {projects.length}
                </span>{" "}
                projects
              </div>
              <div className="text-gray-600">
                Total time spent:{" "}
                <span className="font-semibold text-gray-800">
                  {totalTimeFormatted}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Date Modal */}
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
            <div className="input-group mb-3">
              <label className="form-label">From:</label>
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
              <label className="form-label">To:</label>
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

export default EmployeeCompletedTasks;
