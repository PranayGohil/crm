import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

// Extend dayjs with duration
dayjs.extend(duration);

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

  const filterOptions = [
    "All Time",
    "Today",
    "This Week",
    "This Month",
    "Custom",
  ];
  const [selectedFilter, setSelectedFilter] = useState("This Week");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

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

  useEffect(() => {
    const storedUser = localStorage.getItem("employeeUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      fetchDashboardData(user._id);
    }
  }, [selectedFilter, customRange]);

  const getFilterDates = () => {
    const now = dayjs();
    switch (selectedFilter) {
      case "Today":
        return {
          startDate: now.startOf("day").toISOString(),
          endDate: now.endOf("day").toISOString(),
        };
      case "This Week":
        return {
          startDate: now.startOf("week").toISOString(),
          endDate: now.endOf("week").toISOString(),
        };
      case "This Month":
        return {
          startDate: now.startOf("month").toISOString(),
          endDate: now.endOf("month").toISOString(),
        };
      case "Custom":
        return {
          startDate: new Date(customRange.start).toISOString(),
          endDate: new Date(customRange.end).toISOString(),
        };
      default:
        return {};
    }
  };

  const fetchDashboardData = async (employeeId) => {
    try {
      setLoading(true);
      const filter = getFilterDates();
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/employee/dashboard/${employeeId}`,
        {
          params: filter,
        }
      );

      const filteredProjects = (res.data.projects || []).filter(
        (project) => project.status !== "Completed"
      );

      setProjects(filteredProjects);
      setSubtasks(res.data.subtasks || []);
      setTaskStats((prev) => [
        { ...prev[0], value: res.data.subtasks?.length || "0" },
        { ...prev[1], value: res.data.completed || "0" },
        { ...prev[2], value: res.data.timeLogged || "0h 0m" },
      ]);

      const timers = {};
      (res.data.subtasks || []).forEach((task) => {
        if (task.status === "In Progress") {
          const lastLog = task.time_logs?.[task.time_logs.length - 1];
          if (lastLog && !lastLog.end_time) {
            const elapsed = dayjs().diff(dayjs(lastLog.start_time));
            timers[task._id] = elapsed;
          }
        }
      });
      setRunningTimers(timers);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleTable = (projectId) =>
    setExpandedProjectId(expandedProjectId === projectId ? null : projectId);

  const handleStartStop = async (task) => {
    try {
      const user = JSON.parse(localStorage.getItem("employeeUser"));
      const newStatus =
        task.status === "In Progress" ? "Paused" : "In Progress";

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/subtask/change-status/${task._id}`,
        {
          status: newStatus,
          userId: user._id,
          userRole: "employee",
        }
      );

      fetchDashboardData(user._id);
    } catch (error) {
      console.error("Failed to change subtask status:", error);
      toast.error(
        error.response.data.message || "Failed to change subtask status."
      );
    }
  };

  const handleCopyToClipboard = (url, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.ctrlKey || e.metaKey) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("URL copied to clipboard!"))
      .catch(() => toast.error("Failed to copy URL."));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="employee-dashboard">
      <section className="header ttb-header">
        <div className="head-menu ttb-header-menu">
          <h1>Task board</h1>
          <p>Manage your jewelry production workflow</p>
        </div>
      </section>
      <section className="ett-main-sec">
        <div className="tt-time-tracking ett-emp-tracking-time">
          <div className="ett-time-duration">
            <div className="ett-time-type d-flex gap-3">
              {filterOptions.map((label) => (
                <a
                  key={label}
                  href="#"
                  className={selectedFilter === label ? "ett-today active" : ""}
                  onClick={() => setSelectedFilter(label)}
                >
                  {label}
                </a>
              ))}
            </div>
            {selectedFilter === "Custom" && (
              <div className="d-flex gap-3 mt-2">
                <input
                  type="date"
                  className="form-control"
                  onChange={(e) =>
                    setCustomRange({ ...customRange, start: e.target.value })
                  }
                />
                <input
                  type="date"
                  className="form-control"
                  onChange={(e) =>
                    setCustomRange({ ...customRange, end: e.target.value })
                  }
                />
              </div>
            )}
          </div>
        </div>
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
                    <tr
                      className={`time-table-row ${
                        projectSubtasks.some(
                          (task) =>
                            task.status === "In Progress" &&
                            runningTimers[task._id]
                        )
                          ? "highlight-running"
                          : ""
                      }`}
                    >
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
                      <td>
                        {(() => {
                          const totalProjectMs = projectSubtasks.reduce(
                            (acc, task) => {
                              let taskMs = 0;
                              (task.time_logs || []).forEach((log) => {
                                const start = dayjs(log.start_time);
                                const end = log.end_time
                                  ? dayjs(log.end_time)
                                  : dayjs();
                                taskMs += end.diff(start);
                              });

                              // If currently running, add live duration
                              if (
                                task.status === "In Progress" &&
                                runningTimers[task._id]
                              ) {
                                const unfinishedLog = task.time_logs?.find(
                                  (log) => !log.end_time
                                );
                                if (unfinishedLog) {
                                  const logStart = dayjs(
                                    unfinishedLog.start_time
                                  );
                                  taskMs -= dayjs().diff(logStart);
                                  taskMs += runningTimers[task._id];
                                }
                              }

                              return acc + taskMs;
                            },
                            0
                          );
                          const dur = dayjs.duration(totalProjectMs);
                          return `${dur.hours()}h ${dur.minutes()}m ${dur.seconds()}s`;
                        })()}
                      </td>
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
                          ? dayjs(project.assign_date).format("DD/MM/YYYY")
                          : "-"}
                      </td>
                      <td>
                        {project.due_date
                          ? dayjs(project.due_date).format("DD/MM/YYYY")
                          : "-"}
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
                              <th>URL</th>
                              <th>Stage</th>
                              <th>Timer</th>
                              <th>Time Tracked</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {projectSubtasks.map((task) => {
                              let totalMs = 0;
                              let isRunning = false;

                              (task.time_logs || []).forEach((log) => {
                                const start = dayjs(log.start_time);
                                const end = log.end_time
                                  ? dayjs(log.end_time)
                                  : dayjs();
                                totalMs += end.diff(start);
                                if (!log.end_time) isRunning = true;
                              });

                              if (isRunning && runningTimers[task._id]) {
                                totalMs -= dayjs().diff(
                                  dayjs(
                                    task.time_logs.find((log) => !log.end_time)
                                      ?.start_time
                                  )
                                );
                                totalMs += runningTimers[task._id];
                              }

                              const runningMs = runningTimers[task._id] || 0;
                              const runningDur = dayjs.duration(runningMs);
                              const totalDur = dayjs.duration(totalMs);

                              const runningTimeDisplay = `${runningDur.hours()}h ${runningDur.minutes()}m ${runningDur.seconds()}s`;
                              const timeTrackedDisplay = `${totalDur.hours()}h ${totalDur.minutes()}m ${totalDur.seconds()}s`;

                              const anotherTaskRunning = Object.entries(
                                runningTimers
                              ).some(
                                ([id, time]) => id !== task._id && time > 0
                              );

                              return (
                                <tr
                                  key={task._id}
                                  className={`subtask-row ${
                                    task.status === "In Progress" &&
                                    runningTimers[task._id]
                                      ? "highlight-running"
                                      : ""
                                  }`}
                                >
                                  <td></td>
                                  <td>{task.task_name}</td>
                                  <td>
                                    {task.assign_date
                                      ? dayjs(task.assign_date).format(
                                          "DD/MM/YYYY"
                                        )
                                      : "-"}
                                  </td>
                                  <td>
                                    {task.due_date
                                      ? dayjs(task.due_date).format(
                                          "DD/MM/YYYY"
                                        )
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
                                  <td
                                    style={{
                                      width: "200px",
                                      position: "relative",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        width: "200px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        cursor: "pointer",
                                        color: "#007bff",
                                        paddingRight: "20px", // To give space for the icon
                                        position: "relative",
                                      }}
                                      onClick={(e) =>
                                        handleCopyToClipboard(task.url, e)
                                      }
                                      title="Click to copy. Ctrl+Click to open."
                                    >
                                      <span
                                        style={{
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                        }}
                                      >
                                        {task.url}
                                      </span>

                                      <span
                                        onClick={(e) =>
                                          handleCopyToClipboard(task.url, e)
                                        }
                                        style={{
                                          position: "absolute",
                                          right: "2px",
                                          top: "50%",
                                          transform: "translateY(-50%)",
                                          fontSize: "14px",
                                          color: "#555",
                                          cursor: "pointer",
                                        }}
                                        title="Copy URL"
                                      >
                                        <img
                                          src="/SVG/clipboard.svg"
                                          alt="copy icon"
                                          style={{
                                            width: "16px",
                                            height: "16px",
                                            filter: "hue-rotate(310deg)",
                                            opacity: 0.8,
                                          }}
                                        />
                                      </span>
                                    </div>
                                  </td>

                                  <td>{task.stage}</td>
                                  <td className="ttb-table-pause">
                                    {task.status === "In Progress" ||
                                    !anotherTaskRunning ? (
                                      <div
                                        className={`ttb-table-pause-inner ${
                                          task.status === "In Progress"
                                            ? "ttb-stop-bg-color"
                                            : "ttb-start-bg-color"
                                        }`}
                                        onClick={() => handleStartStop(task)}
                                        style={{ cursor: "pointer" }}
                                      >
                                        <span className="ttb-table-pasuse-btn-containter">
                                          <img
                                            src={
                                              task.status === "In Progress"
                                                ? "/SVG/pause.svg"
                                                : "/SVG/start.svg"
                                            }
                                            alt="toggle"
                                          />
                                          <span>
                                            {task.status === "In Progress"
                                              ? runningTimeDisplay
                                              : "Start"}
                                          </span>
                                        </span>
                                      </div>
                                    ) : (
                                      "-"
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
                              );
                            })}
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
