import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const EmployeeDashboard = () => {
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [taskStats, setTaskStats] = useState([
    {
      icon: "/SVG/clipboard.svg",
      alt: "total task",
      bgClass: "empan-bg-purple",
      label: "Total Tasks",
      value: "0",
    },
    {
      icon: "/SVG/true-yellow.svg",
      alt: "completed week",
      bgClass: "empan-bg-yellow",
      label: "Completed This Week",
      value: "0",
    },
    {
      icon: "/SVG/time-blue.svg",
      alt: "time logged",
      bgClass: "empan-bg-purple",
      label: "Time Logged (This Week)",
      value: "0h 0m",
      link: "EmployeeTimeTracking",
    },
  ]);
  const [projects, setProjects] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [runningTimers, setRunningTimers] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem("employeeUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const employeeId = user._id;
      fetchDashboardData(employeeId);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRunningTimers((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((subtaskId) => {
          updated[subtaskId] += 1000;
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (employeeId) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/employee/dashboard/${employeeId}`
      );

      setProjects(res.data.projects || []);
      setSubtasks(res.data.subtasks || []);

      // Update stats dynamically if you want
      setTaskStats((prev) => [
        { ...prev[0], value: res.data.subtasks?.length || "0" },
        { ...prev[1], value: res.data.completedThisWeek || "0" },
        { ...prev[2], value: res.data.timeLoggedThisWeek || "0h 0m" },
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalTimeMs = (subtasks.time_logs || []).reduce((total, log) => {
    if (log.end_time) {
      return total + (new Date(log.end_time) - new Date(log.start_time));
    } else {
      return total + (new Date() - new Date(log.start_time));
    }
  }, runningTimers[subtasks._id] || 0);

  const totalHours = Math.floor(totalTimeMs / 3600000);
  const totalMinutes = Math.floor((totalTimeMs % 3600000) / 60000);
  const timeTrackedDisplay = `${totalHours}h ${totalMinutes}m`;

  const toggleTable = (projectId) =>
    setExpandedProjectId(expandedProjectId === projectId ? null : projectId);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="employee-dashboard">
      <section className="header ttb-header">
        <div className="head-menu ttb-header-menu">
          <h1>Task board</h1>
          <p>Manage your jewelry production workflow</p>
        </div>
      </section>

      <section className="empan-boxes-main">
        <div className="empan-boxes-inner">
          {taskStats.map((item, index) => {
            const content = (
              <div className="empan-icon-text-box">
                <div className={`empan-icon ${item.bgClass}`}>
                  <img src={item.icon} alt={item.alt} />
                </div>
                <div className="empan-text">
                  <span className="emapn-header-text">{item.label}</span>
                  <span className="emapn-main-text-number">{item.value}</span>
                </div>
              </div>
            );
            return (
              <div key={index}>
                {item.link ? <a href={item.link}>{content}</a> : content}
              </div>
            );
          })}
        </div>
      </section>

      <section className="ttb-table-main">
        <div className="time-table-wrapper empan-time-table-wrapper">
          <table className="time-table-table">
            <thead className="ttb-table-row">
              <tr>
                <th></th>
                <th>Project Name</th>
                <th>Status</th>
                <th>Subtasks</th>
                <th>Total Time</th>
                <th>Priority</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const projectSubtasks = subtasks.filter(
                  (s) =>
                    s.project_id === project._id ||
                    s.project_id?._id === project._id
                );

                return (
                  <React.Fragment key={project._id}>
                    <tr className="time-table-row">
                      <td>
                        <img
                          src="/SVG/arrow.svg"
                          alt="arrow"
                          className={`time-table-toggle-btn ${
                            expandedProjectId === project._id
                              ? "rotate-down"
                              : ""
                          }`}
                          onClick={() => toggleTable(project._id)}
                        />
                      </td>
                      <td>{project.project_name}</td>
                      <td>
                        <span
                          className={`time-table-badge md-status-${(
                            project.status || ""
                          )
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td>{projectSubtasks.length}</td>
                      <td>-</td>
                      <td>
                        <span
                          className={`time-table-badge md-status-${(
                            project.priority || ""
                          ).toLowerCase()}`}
                        >
                          {project.priority}
                        </span>
                      </td>
                      <td>
                        {project.assign_date
                          ? new Date(project.assign_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        {project.due_date
                          ? new Date(project.due_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="time-table-icons">
                        <Link to={`/project/details/${project._id}`}>
                          <img src="/SVG/eye-view.svg" alt="eye-view button" />
                        </Link>
                      </td>
                    </tr>
                    <tr
                      className={`time-table-subtask-row ${
                        expandedProjectId === project._id
                          ? ""
                          : "time-table-hidden"
                      }`}
                    >
                      <td colSpan="10">
                        <table className="time-table-subtable time-table-subtable-left">
                          <thead>
                            <tr>
                              <th></th>
                              <th>Subtask Name</th>
                              <th>Start</th>
                              <th>End</th>
                              <th>Priority</th>
                              <th>Status</th>
                              <th>Stage</th>
                              <th>Timer</th>
                              <th>Time Tracked</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {projectSubtasks.map((task) => (
                              <tr key={task._id}>
                                <td></td>
                                <td>{task.task_name}</td>
                                <td>
                                  {task.assign_date
                                    ? new Date(
                                        task.assign_date
                                      ).toLocaleDateString()
                                    : "-"}
                                </td>
                                <td>
                                  {task.due_date
                                    ? new Date(
                                        task.due_date
                                      ).toLocaleDateString()
                                    : "-"}
                                </td>
                                <td>
                                  <span
                                    className={`time-table-badge md-status-${(
                                      task.priority || ""
                                    ).toLowerCase()}`}
                                  >
                                    {task.priority}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={`time-table-badge md-status-${(
                                      task.status || ""
                                    )
                                      .toLowerCase()
                                      .replace(" ", "-")}`}
                                  >
                                    {task.status}
                                  </span>
                                </td>
                                <td>{task.stage}</td>
                                <td className="ttb-table-pause">
                                  {task.status === "In Progress" ? (
                                    runningTimers[task._id] ? (
                                      <div
                                        className="ttb-table-pause-inner ttb-stop-bg-color"
                                      >
                                        <span className="ttb-table-pasuse-btn-containter">
                                          <img
                                            src="/SVG/pause.svg"
                                            alt="stop"
                                          />
                                          <span>Stop</span>
                                        </span>
                                      </div>
                                    ) : (
                                      <div
                                        className="ttb-table-pause-inner ttb-start-bg-color"
                                      >
                                        <span className="ttb-table-pasuse-btn-containter">
                                          <img
                                            src="/SVG/start.svg"
                                            alt="start"
                                          />
                                          <span>Start</span>
                                        </span>
                                      </div>
                                    )
                                  ) : (
                                    <span>-</span>
                                  )}
                                </td>

                                <td>{timeTrackedDisplay}</td>

                                <td className="time-table-icons">
                                  <Link to={`/subtask/view/${task._id}`}>
                                    <img
                                      src="/SVG/eye-view.svg"
                                      alt="eye-view button"
                                    />
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default EmployeeDashboard;
