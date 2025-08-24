import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useSocket } from "../contexts/SocketContext";
import { statusOptions, priorityOptions } from "../options";
import { IoMdArrowDropdown } from "react-icons/io";

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
      link: "/time-tracking",
    },
  ]);
  const { socket } = useSocket();

  const storedUser = localStorage.getItem("employeeUser");
  const currentEmployeeId = storedUser ? JSON.parse(storedUser)._id : null;

  const [user, setUser] = useState(null);
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
  const [customRange, setCustomRange] = useState({
    start: new Date(),
    end: new Date(),
  });

  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [selectedTask, setSelectedTask] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleNewTask = (task) => {
      const storedUser = localStorage.getItem("employeeUser");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        fetchDashboardData(user._id);
      }
    };

    socket.on("new_subtask", handleNewTask);
    socket.on("subtask_updated", handleNewTask);

    return () => {
      socket.off("new_subtask", handleNewTask);
      socket.off("subtask_updated", handleNewTask);
    };
  }, [socket]);

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
      fetchUser(user._id);
    }
  }, [selectedFilter, customRange, statusFilter, priorityFilter]);

  const fetchUser = async (id) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/employee/get/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(res.data);
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const fetchDashboardData = async (employeeId) => {
    try {
      setLoading(true);
      const filter = getFilterDates();
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/employee/dashboard/${employeeId}`,
        { params: filter }
      );
      console.log(res.data);
      // Step 1: Filter subtasks first (date already applied from backend via params)
      let filteredSubtasks = res.data.subtasks || [];

      if (statusFilter !== "All") {
        filteredSubtasks = filteredSubtasks.filter(
          (t) => (t.status || "").toLowerCase() === statusFilter.toLowerCase()
        );
      }

      if (priorityFilter !== "All") {
        filteredSubtasks = filteredSubtasks.filter(
          (t) =>
            (t.priority || "").toLowerCase() === priorityFilter.toLowerCase()
        );
      }

      // Step 2: Filter projects to only keep ones that have at least 1 filtered subtask
      let filteredProjects = (res.data.projects || []).filter((project) =>
        filteredSubtasks.some(
          (s) =>
            s.project_id === project._id || s.project_id?._id === project._id
        )
      );

      setProjects(filteredProjects);

      // Important: keep the subtasks as-is (they contain employeeCompletedStages, completedByEmployee)
      setSubtasks(filteredSubtasks);

      // Step 3: Update stats
      setTaskStats((prev) => [
        { ...prev[0], value: filteredSubtasks.length || "0" },
        {
          ...prev[1],
          // completed is whether employee completed any stage (flag from backend)
          value:
            filteredSubtasks.filter((t) => t.completedByEmployee).length || "0",
        },
        { ...prev[2], value: res.data.timeLogged || "0h 0m" },
      ]);

      // Step 4: Handle running timers — ONLY consider logs for this employee
      const timers = {};
      filteredSubtasks.forEach((task) => {
        // find last open log that belongs to this employee
        const lastOpenLogForEmployee = (task.time_logs || [])
          .slice()
          .reverse()
          .find(
            (log) =>
              !log.end_time &&
              (log.user_id?.toString?.() || log.user_id) === employeeId
          );

        if (lastOpenLogForEmployee) {
          const elapsed = dayjs().diff(
            dayjs(lastOpenLogForEmployee.start_time)
          );
          timers[task._id] = elapsed;
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

  const toggleTable = (projectId) =>
    setExpandedProjectId(expandedProjectId === projectId ? null : projectId);

  const handleChangeStatus = async (task, status) => {
    if (status === "Completed") {
      setSelectedTask(task);
      setShowCompleteModal(true);
    } else {
      setSelectedTask(null);
      try {
        const user = JSON.parse(localStorage.getItem("employeeUser"));
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/subtask/change-status/${task._id}`,
          {
            status: status,
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
    }
  };

  const completeStage = async (task) => {
    console.log(task);
    try {
      const user = JSON.parse(localStorage.getItem("employeeUser"));
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/subtask/complete-stage/${task._id}`
      );
      toast.success("Stage marked as completed!");
      fetchDashboardData(user._id);
    } catch (err) {
      toast.error("Failed to complete stage");
    } finally {
      setShowCompleteModal(false);
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
        <div className="text-end">
          {user?.reporting_manager?.full_name && (
            <>
              <h5 className="fw-bold">Reported By</h5>
              <small>{user.reporting_manager?.full_name}</small>
            </>
          )}
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
                  value={customRange.start}
                  onChange={(e) => {
                    console.log(e.target.value);
                    setCustomRange({ ...customRange, start: e.target.value });
                  }}
                />
                <input
                  type="date"
                  className="form-control"
                  value={customRange.end}
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
        <div className="d-flex gap-3 align-items-center mt-3 px-5">
          {/* Status Filter */}
          <div style={{ width: "300px" }}>
            <label className="form-label">Filter Subtasks by Status:</label>
            <div className="flex">
              <select
                id="statusFilter"
                className="form-control custom-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority Filter */}
          <div style={{ width: "300px" }}>
            <label className="form-label">Filter Subtasks by Priority:</label>
            <select
              className="form-control custom-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="All">All Priority</option>
              {priorityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
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
                            .replace(" ", "")}`}
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
                      <td>
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
                              <th>URL</th>
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
                                const logUserId =
                                  log.user_id?.toString?.() || log.user_id;
                                if (logUserId !== currentEmployeeId) return; // skip other users' logs

                                const start = dayjs(log.start_time);
                                const end = log.end_time
                                  ? dayjs(log.end_time)
                                  : dayjs();
                                totalMs += end.diff(start);
                                if (!log.end_time) isRunning = true;
                              });

                              if (isRunning && runningTimers[task._id]) {
                                // adjust the currently-open log to use the live timer we track
                                const openLog = (task.time_logs || []).find(
                                  (log) =>
                                    !log.end_time &&
                                    (log.user_id?.toString?.() ||
                                      log.user_id) === currentEmployeeId
                                );
                                if (openLog) {
                                  // subtract naive now-diff and add runningTimers value (keeps consistent live display)
                                  totalMs -= dayjs().diff(
                                    dayjs(openLog.start_time)
                                  );
                                  totalMs += runningTimers[task._id];
                                }
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
                                    {(() => {
                                      const assignToId =
                                        task.assign_to?.toString?.() ||
                                        task.assign_to;

                                      const showCompletedForEmployee =
                                        (!assignToId &&
                                          task.completedByEmployee) ||
                                        (assignToId &&
                                          assignToId !== currentEmployeeId &&
                                          task.completedByEmployee);

                                      // compute what should be shown
                                      const displayStatus =
                                        showCompletedForEmployee
                                          ? "Completed"
                                          : task.status || "-";

                                      if (
                                        showCompletedForEmployee &&
                                        !task.currentStageAssignedToEmployee
                                      ) {
                                        // ✅ just show badge, no dropdown
                                        return (
                                          <span
                                            className={`time-table-badge md-status-${displayStatus
                                              .toLowerCase()
                                              .replace(" ", "")}`}
                                          >
                                            {displayStatus}
                                          </span>
                                        );
                                      }

                                      // ✅ otherwise show dropdown
                                      return (
                                        <select
                                          className={`time-table-badge md-status-${displayStatus
                                            .toLowerCase()
                                            .replace(" ", "")}`}
                                          value={displayStatus}
                                          onChange={(e) =>
                                            handleChangeStatus(
                                              task,
                                              e.target.value
                                            )
                                          }
                                          style={{
                                            minWidth: "100px",
                                            padding: "4px 6px",
                                            borderRadius: "6px",
                                          }}
                                        >
                                          {statusOptions.map((status) => (
                                            <option
                                              key={status}
                                              value={status}
                                              className={`md-status-${status
                                                .toLowerCase()
                                                .replace(" ", "")}`}
                                            >
                                              {status}
                                            </option>
                                          ))}
                                        </select>
                                      );
                                    })()}
                                  </td>

                                  <td>
                                    {task.employeeCompletedStages &&
                                    task.employeeCompletedStages.length > 0 ? (
                                      <div>
                                        {task.employeeCompletedStages.map(
                                          (stageName, idx) => (
                                            <small
                                              key={`emp-stage-${idx}`}
                                              style={{
                                                display: "inline-block",
                                                marginRight: "6px",
                                                padding: "4px 10px",
                                                borderRadius: "12px",
                                                background: "#e6ffed",
                                                color: "#097a3f",
                                                border: "1px solid #b7f0c6",
                                                fontSize: "12px",
                                              }}
                                            >
                                              ✓ {stageName}
                                            </small>
                                          )
                                        )}

                                        {task.currentStageAssignedToEmployee && (
                                          <small
                                            style={{
                                              padding: "6px 12px",
                                              borderRadius: "12px",
                                              background: "#f3f4f6",
                                              color: "#444",
                                              border: "1px solid #e0e0e0",
                                              fontSize: "12px",
                                            }}
                                          >
                                            {
                                              task.stages[
                                                task.current_stage_index
                                              ].name
                                            }
                                          </small>
                                        )}
                                      </div>
                                    ) : // if none completed by employee, show the current stage as before:
                                    Array.isArray(task.stages) &&
                                      task.stages.length > 0 &&
                                      task.current_stage_index !== undefined ? (
                                      (() => {
                                        const currentStage =
                                          task.stages[task.current_stage_index];
                                        const name =
                                          typeof currentStage === "string"
                                            ? currentStage
                                            : currentStage.name;
                                        const completed =
                                          currentStage?.completed;
                                        return (
                                          <small
                                            style={{
                                              padding: "6px 12px",
                                              borderRadius: "12px",
                                              background: completed
                                                ? "#e6ffed"
                                                : "#f3f4f6",
                                              color: completed
                                                ? "#097a3f"
                                                : "#444",
                                              border: completed
                                                ? "1px solid #b7f0c6"
                                                : "1px solid #e0e0e0",
                                              fontSize: "12px",
                                            }}
                                          >
                                            {completed ? "✓ " : ""}
                                            {name}
                                          </small>
                                        );
                                      })()
                                    ) : (
                                      "No current stage"
                                    )}
                                  </td>

                                  <td
                                    style={{
                                      width: "200px",
                                      position: "relative",
                                    }}
                                  >
                                    {task.url ? (
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
                                    ) : (
                                      <small>No URL</small>
                                    )}
                                  </td>
                                  <td className="ttb-table-pause">
                                    {task.status === "In Progress" ||
                                    !anotherTaskRunning ? (
                                      <div
                                        className={`ttb-table-pause-inner ${
                                          task.status === "In Progress"
                                            ? "ttb-stop-bg-color"
                                            : "ttb-start-bg-color"
                                        }`}
                                        onClick={() =>
                                          handleChangeStatus(
                                            task,
                                            task.status === "In Progress"
                                              ? "Paused"
                                              : "In Progress"
                                          )
                                        }
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
      <Modal
        show={showCompleteModal}
        onHide={() => {
          setSelectedTask(null);
          setShowCompleteModal(false);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Complete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Confirm that you completed the task?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setSelectedTask(null);
              setShowCompleteModal(false);
            }}
          >
            Cancel
          </Button>
          <Button variant="success" onClick={() => completeStage(selectedTask)}>
            Complete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EmployeeDashboard;
