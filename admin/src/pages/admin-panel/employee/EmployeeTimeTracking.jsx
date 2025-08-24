// EmployeeTimeTracking.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { Modal, Button } from "react-bootstrap";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";

const EmployeeTimeTracking = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [openTable, setOpenTable] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("Today");
  const [customDateRange, setCustomDateRange] = useState({
    from: null,
    to: null,
  });
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);

  const employeeId = useParams().id;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projRes, subRes] = await Promise.all([
          axios.get(
            `${process.env.REACT_APP_API_URL}/api/project/get-all-archived`
          ),
          axios.get(
            `${process.env.REACT_APP_API_URL}/api/employee/tasks/${employeeId}`
          ),
        ]);
        setProjects(projRes.data);
        setSubtasks(subRes.data);
        console.log("projects", projRes.data);
        console.log("subtasks", subRes.data);
      } catch (error) {
        console.error("Data fetching error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (employeeId) fetchData();
  }, [employeeId]);

  const handleToggle = (id) => {
    setOpenTable((prev) => (prev === id ? null : id));
  };

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

  const calculateTimeSpent = (timeLogs) => {
    let total = 0;
    timeLogs?.forEach((log) => {
      if (log.start_time && log.end_time && isWithinFilter(log.start_time)) {
        const diff = moment(log.end_time).diff(
          moment(log.start_time),
          "seconds"
        );
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

  const filteredSubtasks = subtasks.filter((s) =>
    s.time_logs?.some((log) =>
      log.start_time && log.end_time ? isWithinFilter(log.start_time) : false
    )
  );

  const summaryData = {
    mainTasks: new Set(filteredSubtasks.map((s) => s.project_id._id)).size,
    subtasks: filteredSubtasks.length,
    totalTimeTracked: filteredSubtasks.reduce((acc, sub) => {
      const time = sub.time_logs?.reduce((subTotal, log) => {
        if (log.start_time && log.end_time && isWithinFilter(log.start_time)) {
          const diff = moment(log.end_time).diff(
            moment(log.start_time),
            "seconds"
          );
          return subTotal + diff;
        }
        return subTotal;
      }, 0);
      return acc + time;
    }, 0),
  };

  const totalTimeTrackedFormatted = moment
    .utc(summaryData.totalTimeTracked * 1000)
    .format("HH:mm:ss");

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
            <h1 className="header-title">My Time Tracking</h1>
          </div>
          <p className="project-name">
            Track your time spent on tasks and projects
          </p>
        </div>
      </section>

      {/* Stats */}
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

      {/* Filters */}
      <section className="table-container">
        <div className="table-controls">
          <div className="controls-left">
            <div className="filter-group">
              <span className="filter-label">Time Range:</span>
              <div className="filter-options">
                {["All Time", "Today", "This Week", "This Month", "Custom"].map(
                  (label) => (
                    <button
                      key={label}
                      className={`filter-btn ${
                        selectedFilter === label ? "active" : ""
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
        </div>

        {/* Projects List */}
        <div className="projects-list">
          {projects.map((project) => {
            console.log("Subtasks:", filteredSubtasks);
            const projectSubtasks = filteredSubtasks.filter(
              (s) => s.project_id._id === project._id
            );

            const totalTime = projectSubtasks.reduce((acc, sub) => {
              const time = moment
                .duration(calculateTimeSpent(sub.time_logs))
                .asSeconds();
              return acc + time;
            }, 0);
            const duration = moment.duration(totalTime, "seconds");
            const formattedTime = `${duration.days()}d ${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`;

            if (projectSubtasks.length === 0) return null;

            return (
              <div key={project._id} className="project-item">
                <div
                  className={`project-header ${
                    openTable === project._id ? "open" : ""
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
                    className={`dropdown-arrow ${
                      openTable === project._id ? "rotated" : ""
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
                        </tr>
                      </thead>
                      <tbody>
                        {projectSubtasks.map((subtask, index) => {
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
                                <span
                                  className={`stage-badge ${
                                    subtask.stage === "CAD Design"
                                      ? "stage-cad"
                                      : subtask.stage === "SET Design"
                                      ? "stage-set"
                                      : subtask.stage === "Delivery"
                                      ? "stage-delivery"
                                      : subtask.stage === "Render"
                                      ? "stage-render"
                                      : "stage-default"
                                  }`}
                                >
                                  {subtask.stage}
                                </span>
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
                                  className={`status-badge ${
                                    remaining === "Completed"
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
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="pagination-container">
          <div className="pagination-info">
            Showing <span className="highlight">{summaryData.mainTasks}</span>{" "}
            main tasks (
            <span className="highlight">{summaryData.subtasks}</span> subtasks)
          </div>
          <div className="pagination-info">
            Total time tracked:{" "}
            <span className="highlight">{totalTimeTrackedFormatted}</span>
          </div>
        </div>
      </section>

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

export default EmployeeTimeTracking;
