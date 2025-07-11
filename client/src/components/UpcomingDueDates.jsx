import React, { useEffect, useState } from "react";
import axios from "axios";

const UpcomingDueDates = () => {
  const [dueTasks, setDueTasks] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/statistics/upcoming-due-dates`)
      .then((res) => setDueTasks(res.data))
      .catch((err) => console.error(err));
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <section className="md-overview-upcoming-due-date">
      <div className="md-overview-upcoming-due-date-inner">
        <div className="md-upcomoing-header-btn">
          <h2>Upcoming Due Dates</h2>
          <a href="#">View All</a>
        </div>
        <div className="md-overview-upcoming-table">
          <table className="md-table-container">
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Project</th>
                <th>Due Date</th>
                <th>Assigned To</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dueTasks.map((task, index) => (
                <tr key={index}>
                  <td>{task.task_name}</td>
                  <td>{task.project_id?.project_name || "N/A"}</td>
                  <td>
                    {task.project_id?.due_date
                      ? formatDate(task.project_id.due_date)
                      : "N/A"}
                  </td>

                  <td>
                    <div className="md-assigned-user">
                      <img
                        src={
                          task.asign_to?.[0]?.id?.profile_pic ||
                          "/Image/user.jpg"
                        }
                        alt="user"
                      />
                      {task.asign_to?.[0]?.id?.full_name || "N/A"}
                    </div>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default UpcomingDueDates;
