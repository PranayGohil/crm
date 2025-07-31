import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

const TimeTrackingDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [openTable, setOpenTable] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("Today");
  const [customDateRange, setCustomDateRange] = useState({
    from: null,
    to: null,
  });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("All");

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, subRes, empRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/project/get-all`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/subtask/get-all`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/employee/get-all`),
        ]);
        setProjects(projRes.data);
        setSubtasks(subRes.data);
        setEmployees(empRes.data);
      } catch (error) {
        console.error("Data fetching error:", error);
      }
    };
    fetchData();
  }, []);

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
      case "Custom":
        if (customDateRange.from && customDateRange.to) {
          const from = moment(customDateRange.from);
          const to = moment(customDateRange.to).endOf("day");
          return date.isBetween(from, to, null, "[]");
        }
        return false;
      default:
        return true;
    }
  };

  const calculateTimeSpent = (timeLogs) => {
    let total = 0;
    timeLogs?.forEach((log) => {
      if (
        log.start_time &&
        log.end_time &&
        isWithinFilter(log.start_time) // Filter-aware
      ) {
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

  const getEmployeeById = (id) => {
    return employees.find((emp) => emp._id === id);
  };

  const filteredSubtasks = subtasks.filter(
    (s) => selectedEmployeeId === "All" || s.assign_to === selectedEmployeeId
  );

  const summaryData = {
    mainTasks: new Set(filteredSubtasks.map((s) => s.project_id)).size,
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

  return (
    <div className="time-tracking-dashboard-page p-3">
      <section className="ett-main-sec">
        <div className="tt-time-tracking ett-emp-tracking-time">
          <div className="ett-tracking-time-heading">
            <div className="ett-tracking-inner">
              <h1>Team Time Tracking</h1>
              <p>Track time spent by your team across tasks and projects.</p>
            </div>
          </div>
          <div className="ett-time-duration">
            <div>
              <div className="ett-time-type d-flex gap-3">
                {["Today", "This Week", "This Month", "Custom"].map((label) => (
                  <a
                    key={label}
                    href="#"
                    className={
                      selectedFilter === label ? "ett-today active" : ""
                    }
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
                      setCustomDateRange((prev) => ({
                        ...prev,
                        from: e.target.value,
                      }))
                    }
                  />
                  <input
                    type="date"
                    className="form-control"
                    onChange={(e) =>
                      setCustomDateRange((prev) => ({
                        ...prev,
                        to: e.target.value,
                      }))
                    }
                  />
                </div>
              )}
            </div>
            <div className="mt-3">
              <select
                className="form-select"
                style={{ maxWidth: "300px" }}
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
              >
                <option value="All">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* <div className="filter">
              <img src="/SVG/filter-vector.svg" alt="search" />
              <span>Filters</span>
            </div> */}
          </div>
        </div>
      </section>

      <section className="ett-task-time p-3">
        <div className="ett-table-heading">
          <p>Project</p>
          <p>Total Working Time</p>
          <p>Action</p>
        </div>

        {projects.map((project) => {
          const projectSubtasks = subtasks.filter(
            (s) =>
              s.project_id === project._id &&
              (selectedEmployeeId === "All" ||
                s.assign_to === selectedEmployeeId)
          );

          const totalTime = projectSubtasks.reduce((acc, sub) => {
            const time = moment
              .duration(calculateTimeSpent(sub.time_logs))
              .asSeconds();
            return acc + time;
          }, 0);
          const duration = moment.duration(totalTime, "seconds");
          const formattedTime = `${duration.days()}d ${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`;

          return (
            <React.Fragment key={project._id}>
              <div className="btn_main">
                <div
                  className={`ett-menu1 dropdown_toggle ${
                    openTable === project._id ? "open" : ""
                  }`}
                  onClick={() => handleToggle(project._id)}
                >
                  <div className="task-name">{project.project_name}</div>
                  <div className="task-time">{formattedTime}</div>
                  <img
                    src="SVG/header-vector.svg"
                    alt="vec"
                    className="arrow_icon"
                  />
                </div>
              </div>
              <div
                className="px-5 mb-3"
                style={{ borderBottom: "1px solid #ccc" }}
              >
                <table
                  id={project._id}
                  className="ett-main-task-table subtask-table"
                  style={{
                    display: openTable === project._id ? "table" : "none",
                  }}
                >
                  <thead>
                    <tr>
                      <th>Subtask Name</th>
                      <th>Stage</th>
                      <th>Due Date</th>
                      <th>Remaining Time</th>
                      <th>Time Spent</th>
                      <th>Assigned Employees</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectSubtasks.map((subtask, index) => {
                      const employee = getEmployeeById(subtask.assign_to);
                      const spent = calculateTimeSpent(subtask.time_logs);
                      const remaining = calculateRemainingTime(
                        subtask.due_date,
                        subtask.status
                      );

                      return (
                        <tr key={index}>
                          <td>{subtask.task_name}</td>
                          <td>
                            <span
                              className={`py-2 px-3 css-stage ${
                                subtask.stage === "CAD Design"
                                  ? "badge bg-primary"
                                  : subtask.stage === "SET Design"
                                  ? "badge bg-warning"
                                  : subtask.stage === "Delivery"
                                  ? "badge bg-success"
                                  : subtask.stage === "Render"
                                  ? "badge bg-info"
                                  : ""
                              }`}
                            >
                              {subtask.stage}
                            </span>
                          </td>
                          <td>
                            {moment(subtask.due_date).format("DD MMM YYYY")}
                          </td>
                          <td>
                            <span
                              className={`py-2 px-3 ${
                                remaining === "Completed"
                                  ? "badge bg-success"
                                  : remaining === "Overdue"
                                  ? "badge bg-danger"
                                  : "badge bg-primary"
                              }`}
                            >
                              {remaining}
                            </span>
                          </td>
                          <td>{spent}</td>
                          <td>
                            <span className="css-ankit">
                              {employee?.profile_pic && (
                                <img src={employee.profile_pic} alt="emp" />
                              )}
                              {employee?.full_name || "N/A"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </React.Fragment>
          );
        })}
      </section>

      <section className="tt-showing-task-detail">
        <div className="tt-showing-task">
          <p>
            Showing <span>{summaryData.mainTasks}</span> main tasks
          </p>
          <p>
            (<span>{summaryData.subtasks}</span> subtasks total)
          </p>
        </div>
        <div className="tt-showing-time-tracking">
          <span>Total time tracked: {totalTimeTrackedFormatted}</span>
        </div>
      </section>

      {/* <TeamSummary /> */}
    </div>
  );
};

export default TimeTrackingDashboard;
