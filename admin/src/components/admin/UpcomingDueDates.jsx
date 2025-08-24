import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingOverlay from "./LoadingOverlay";
import { Link } from "react-router-dom";

const UpcomingDueDates = () => {
  const [loading, setLoading] = useState(false);
  const [dueTasks, setDueTasks] = useState([]);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/statistics/upcoming-due-dates`)
      .then((res) => {
        const sortedData = [...res.data].sort((a, b) => {
          const dateA = a.project_id?.due_date
            ? new Date(a.project_id.due_date)
            : new Date(0);
          const dateB = b.project_id?.due_date
            ? new Date(b.project_id.due_date)
            : new Date(0);
          return dateA - dateB; // ascending order
        });
        setDueTasks(sortedData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getDaysRemaining = (dueDateStr) => {
    if (!dueDateStr) return null;
    const dueDate = new Date(dueDateStr);
    const today = new Date();
    const diffTime = dueDate - today;
    return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
  };

  const getRemainingDaysBadgeClass = (days) => {
    if (days === null) return "remaining-days-default";
    if (days < 7) return "remaining-days-danger";
    if (days < 14) return "remaining-days-warning";
    return "remaining-days-success";
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return "status-default";
    const statusLower = status.toLowerCase().replace(" ", "-");
    return `status-${statusLower}`;
  };

  if (loading) return <LoadingOverlay />;

  return (
    <div>
      <style jsx>{`
        .project-cell {
          max-width: 200px;
        }

        .project-name {
          font-weight: 600;
          color: #0a3749;
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .remaining-days-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .remaining-days-danger {
          background: #fff5f5;
          color: #dc3545;
          border: 1px solid #f5c6cb;
        }

        .remaining-days-warning {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }

        .remaining-days-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .remaining-days-default {
          background: #f8f9fa;
          color: #6c757d;
          border: 1px solid #e9ecef;
        }

        .days-number {
          font-weight: 700;
          font-size: 14px;
        }

        .days-text {
          font-weight: 500;
          font-size: 11px;
        }

        /* Enhanced Status Badges */
        .status-default {
          background: #f8f9fa;
          color: #6c757d;
          border: 1px solid #e9ecef;
        }

        .status-default .status-dot {
          background: #6c757d;
        }

        /* No Data Container */
        .no-data-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          color: #6c757d;
        }

        .no-data-icon {
          opacity: 0.5;
        }

        .no-data-text {
          font-size: 16px;
          font-weight: 500;
          margin: 0;
          color: #6c757d;
        }

        /* Table Summary Footer */
        .table-summary {
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
          padding: 20px;
        }

        .summary-stats {
          display: flex;
          gap: 32px;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .summary-label {
          font-size: 14px;
          color: #6c757d;
          font-weight: 500;
        }

        .summary-value {
          font-size: 18px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 12px;
          background: #e9ecef;
          color: #495057;
          min-width: 32px;
          text-align: center;
        }

        .summary-value.critical {
          background: #fff5f5;
          color: #dc3545;
          border: 1px solid #f5c6cb;
        }

        .summary-value.warning {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }

        @media (max-width: 768px) {
          .summary-stats {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .summary-item {
            justify-content: space-between;
            padding: 8px 12px;
            background: white;
            border-radius: 6px;
            border: 1px solid #e9ecef;
          }

          .remaining-days-badge {
            font-size: 11px;
            padding: 4px 8px;
          }

          .days-number {
            font-size: 12px;
          }

          .days-text {
            font-size: 10px;
          }

          .project-cell,
          .task-name-cell {
            max-width: 150px;
          }
        }
      `}</style>
      <section className="table-container">
        <div className="stats-info p-3 flex justify-between">
          <div>
            <span className="stats-number mr-2">{dueTasks.length}</span>
            <span>Upcoming Due Dates</span>
          </div>
          <Link to="/subtask/upcoming-due-dates" className="mx-3 border py-1 px-3 rounded text-white bg-blue-600 hover:bg-blue-700">View All</Link>
        </div>
        <div className="">
          <div style={{ overflow: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <div className="header-content-wrapper">
                      <div className="header-main">Project</div>
                    </div>
                  </th>
                  <th>
                    <div className="header-content-wrapper">
                      <div className="header-main">Task Name</div>
                    </div>
                  </th>
                  <th>
                    <div className="header-content-wrapper">
                      <div className="header-main">Task Due Date</div>
                    </div>
                  </th>
                  <th>
                    <div className="header-content-wrapper">
                      <div className="header-main">Project Due Date</div>
                    </div>
                  </th>
                  <th>
                    <div className="header-content-wrapper">
                      <div className="header-main">Assigned To</div>
                    </div>
                  </th>
                  <th>
                    <div className="header-content-wrapper">
                      <div className="header-main">Remaining Days</div>
                    </div>
                  </th>
                  <th>
                    <div className="header-content-wrapper">
                      <div className="header-main">Status</div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {dueTasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      <div className="no-data-container">
                        <div className="no-data-icon">
                          <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <rect
                              x="3"
                              y="4"
                              width="18"
                              height="18"
                              rx="2"
                              ry="2"
                            />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </div>
                        <p className="no-data-text">
                          No upcoming due tasks found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  dueTasks.slice(0, 5).map((task, index) => {
                    const daysLeft = getDaysRemaining(task.due_date);
                    const remainingDaysClass =
                      getRemainingDaysBadgeClass(daysLeft);
                    const statusClass = getStatusBadgeClass(task.status);

                    return (
                      <tr key={index}>
                        <td>
                          <div className="project-cell">
                            <span
                              className="project-name"
                              title={task.project_id?.project_name || "N/A"}
                            >
                              {task.project_id?.project_name || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="task-name-cell">
                            <span
                              className="task-name-text"
                              title={task.task_name || "N/A"}
                            >
                              {task.task_name || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="date-cell">
                            {formatDate(task.due_date)}
                          </span>
                        </td>
                        <td>
                          <span className="date-cell">
                            {formatDate(task.project_id?.due_date)}
                          </span>
                        </td>
                        <td>
                          <div className="assignee-cell">
                            {task.assign_to?.profile_pic ? (
                              <img
                                src={task.assign_to.profile_pic}
                                alt={task.assign_to?.full_name || "User"}
                                className="assignee-avatar"
                              />
                            ) : (
                              <div className="assignee-avatar-placeholder">
                                {task.assign_to?.full_name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "?"}
                              </div>
                            )}
                            <span className="assignee-name">
                              {task.assign_to?.full_name || "Unassigned"}
                            </span>
                          </div>
                        </td>
                        <td>
                          {daysLeft !== null ? (
                            <span
                              className={`remaining-days-badge ${remainingDaysClass}`}
                            >
                              <span className="days-number">{daysLeft}</span>
                              <span className="days-text">
                                {daysLeft === 1 ? "Day" : "Days"} Remaining
                              </span>
                            </span>
                          ) : (
                            <span className="no-data">N/A</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${statusClass}`}>
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
        </div>
      </section>
    </div>
  );
};

export default UpcomingDueDates;
