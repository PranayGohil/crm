import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingOverlay from "../../components/admin/LoadingOverlay";
import { Link } from "react-router-dom";

const UpcomingDueDatesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dueTasks, setDueTasks] = useState([]);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/statistics/upcoming-due-dates`)
      .then((res) => setDueTasks(res.data))
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
  if (loading) return <LoadingOverlay />;

  return (
    <section className="md-overview-upcoming-due-date">
      <div className="md-overview-upcoming-due-date-inner">
        <div className="d-flex align-items-center mb-5">
          <div
            className="anp-back-btn"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
            style={{ cursor: "pointer" }}
          >
            <img
              src="/SVG/arrow-pc.svg"
              alt="back"
              className="mx-3"
              style={{ scale: "1.3" }}
            />
          </div>
          <div className="head-menu ms-3">
            <h1 style={{ marginBottom: "0", fontSize: "1.5rem" }}>
              Upcoming Due Dates
            </h1>
          </div>
        </div>
        <div className="md-overview-upcoming-table">
          <table className="md-table-container">
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Project</th>
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
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No upcoming due tasks.
                  </td>
                </tr>
              ) : (
                dueTasks.map((task, index) => {
                  const dueDate = task.due_date
                    ? new Date(task.due_date)
                    : null;
                  const today = new Date();
                  const diffTime = dueDate ? dueDate - today : null;
                  const daysLeft = dueDate
                    ? Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0)
                    : null;

                  let badgeClass = "badge text-bg-success";
                  if (daysLeft !== null) {
                    if (daysLeft < 7) badgeClass = "badge text-bg-danger";
                    else if (daysLeft < 14)
                      badgeClass = "badge text-bg-warning";
                  }

                  return (
                    <tr key={index}>
                      <td>{task.task_name || "N/A"}</td>
                      <td>{task.project_id?.project_name || "N/A"}</td>
                      <td>{formatDate(task.due_date)}</td>
                      <td>{formatDate(task.project_id?.due_date)}</td>
                      <td>
                        <div
                          className="md-assigned-user"
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          {task.assign_to?.profile_pic ? (
                            <img
                              src={task.assign_to.profile_pic}
                              alt={task.assign_to?.full_name || "User"}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                marginRight: "8px",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                backgroundColor: "#0a3749",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                marginRight: "8px",
                              }}
                            >
                              {task.assign_to?.full_name?.charAt(0) || "?"}
                            </div>
                          )}
                          <span>{task.assign_to?.full_name || "N/A"}</span>
                        </div>
                      </td>

                      <td>
                        {daysLeft !== null ? (
                          <span
                            className={`remaining-days-badge p-2 ${badgeClass}`}
                          >
                            {daysLeft} Days Remaining
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>
                        <span
                          className={`md-status-btn ${
                            task.status?.toLowerCase() || "unknown"
                          }`}
                        >
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
  );
};

export default UpcomingDueDatesPage;
