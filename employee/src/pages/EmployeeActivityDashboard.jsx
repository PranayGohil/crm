// EmployeeActivityDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { Modal, Button } from "react-bootstrap";
import LoadingOverlay from "../components/LoadingOverlay";
const EmployeeActivityDashboard = () => {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("employeeUser");
  const employeeId = storedUser ? JSON.parse(storedUser)._id : null;

  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("This Week");
  const [customDateRange, setCustomDateRange] = useState({
    from: null,
    to: null,
  });
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [activityTypeFilter, setActivityTypeFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchActivityData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/employee/activity-history/${employeeId}`
        );
        setActivities(response.data.activities);

        // Extract unique projects
        const uniqueProjects = [
          ...new Set(response.data.activities.map((a) => a.project_name)),
        ];
        setProjects(uniqueProjects.filter(Boolean));

        console.log("Activity data:", response.data);
      } catch (error) {
        console.error("Error fetching activity data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (employeeId) fetchActivityData();
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

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    const dateMatch = isWithinFilter(activity.timestamp);
    const typeMatch =
      activityTypeFilter === "All" || activity.type === activityTypeFilter;
    const projectMatch =
      projectFilter === "All" || activity.project_name === projectFilter;
    return dateMatch && typeMatch && projectMatch;
  });

  // Group activities by date
  const groupedByDate = filteredActivities.reduce((acc, activity) => {
    const dateKey = moment(activity.timestamp).format("YYYY-MM-DD");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(activity);
    return acc;
  }, {});

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
    moment(b).diff(moment(a))
  );

  // Calculate statistics
  const stats = {
    totalActivities: filteredActivities.length,
    tasksStarted: filteredActivities.filter((a) => a.type === "task_started")
      .length,
    tasksPaused: filteredActivities.filter((a) => a.type === "task_paused")
      .length,
    tasksCompleted: filteredActivities.filter(
      (a) => a.type === "stage_completed"
    ).length,
    statusChanges: filteredActivities.filter((a) => a.type === "status_changed")
      .length,
    totalTimeSpent: filteredActivities
      .filter((a) => a.duration_seconds)
      .reduce((acc, a) => acc + a.duration_seconds, 0),
  };

  const totalDuration = moment.duration(stats.totalTimeSpent, "seconds");
  const totalTimeFormatted = `${Math.floor(
    totalDuration.asDays()
  )}d ${totalDuration.hours()}h ${totalDuration.minutes()}m`;

  // Activity type configurations
  const getActivityConfig = (type) => {
    const configs = {
      task_started: {
        icon: "▶️",
        color: "#10b981",
        bgColor: "#d1fae5",
        label: "Started Task",
      },
      task_paused: {
        icon: "⏸️",
        color: "#f59e0b",
        bgColor: "#fef3c7",
        label: "Paused Task",
      },
      status_changed: {
        icon: "🔄",
        color: "#3b82f6",
        bgColor: "#dbeafe",
        label: "Status Changed",
      },
      stage_completed: {
        icon: "✅",
        color: "#8b5cf6",
        bgColor: "#ede9fe",
        label: "Stage Completed",
      },
      task_assigned: {
        icon: "📌",
        color: "#ec4899",
        bgColor: "#fce7f3",
        label: "Task Assigned",
      },
    };
    return (
      configs[type] || {
        icon: "📝",
        color: "#6b7280",
        bgColor: "#f3f4f6",
        label: type,
      }
    );
  };

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
                Activity Dashboard
              </h1>
              <p className="text-gray-600">
                Complete history of all your task activities and actions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period:
            </label>
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

        {/* Additional Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Type:
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={activityTypeFilter}
              onChange={(e) => setActivityTypeFilter(e.target.value)}
            >
              <option value="All">All Activities</option>
              <option value="task_started">Tasks Started</option>
              <option value="task_paused">Tasks Paused</option>
              <option value="stage_completed">Stages Completed</option>
              <option value="status_changed">Status Changes</option>
              <option value="task_assigned">Tasks Assigned</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project:
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            >
              <option value="All">All Projects</option>
              {projects.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-800">
              {stats.totalActivities}
            </div>
            <div className="text-xs text-gray-600 mt-1">Total Activities</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.tasksStarted}
            </div>
            <div className="text-xs text-gray-600 mt-1">Tasks Started</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.tasksPaused}
            </div>
            <div className="text-xs text-gray-600 mt-1">Tasks Paused</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-purple-600">
              {stats.tasksCompleted}
            </div>
            <div className="text-xs text-gray-600 mt-1">Stages Completed</div>
          </div>

          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats.statusChanges}
            </div>
            <div className="text-xs text-gray-600 mt-1">Status Changes</div>
          </div> */}

          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-800">
              {totalTimeFormatted}
            </div>
            <div className="text-xs text-gray-600 mt-1">Time Tracked</div>
          </div> */}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Activity Timeline
        </h2>

        {sortedDates.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
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
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              No activities found for the selected period
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((dateKey) => {
              const dayActivities = groupedByDate[dateKey];
              const isToday = moment(dateKey).isSame(moment(), "day");
              const isYesterday = moment(dateKey).isSame(
                moment().subtract(1, "day"),
                "day"
              );

              let dateLabel = moment(dateKey).format("dddd, MMMM DD, YYYY");
              if (isToday) dateLabel = "Today - " + dateLabel;
              if (isYesterday) dateLabel = "Yesterday - " + dateLabel;

              return (
                <div key={dateKey}>
                  {/* Date Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">
                        {moment(dateKey).format("DD")}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-md font-semibold text-gray-800">
                        {dateLabel}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {dayActivities.length} activities
                      </p>
                    </div>
                  </div>

                  {/* Activities for this date */}
                  <div className="ml-6 pl-6 border-l-2 border-gray-200 space-y-3">
                    {dayActivities.map((activity, index) => {
                      const config = getActivityConfig(activity.type);

                      return (
                        <div
                          key={index}
                          className="relative bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                        >
                          {/* Timeline dot */}
                          <div
                            className="absolute -left-[27px] top-6 w-3 h-3 rounded-full border-2 border-white"
                            style={{ backgroundColor: config.color }}
                          />

                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              {/* Icon */}
                              <div
                                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                                style={{ backgroundColor: config.bgColor }}
                              >
                                {config.icon}
                              </div>

                              {/* Content */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className="text-sm font-semibold"
                                    style={{ color: config.color }}
                                  >
                                    {config.label}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {moment(activity.timestamp).format(
                                      "hh:mm A"
                                    )}
                                  </span>
                                </div>

                                <div className="text-sm text-gray-800 font-medium mb-1">
                                  {activity.task_name}
                                </div>

                                <div className="text-xs text-gray-600">
                                  Project:{" "}
                                  <span className="font-medium">
                                    {activity.project_name}
                                  </span>
                                </div>

                                {activity.stage_name && (
                                  <div className="mt-2">
                                    <span
                                      className="inline-block text-xs px-2 py-1 rounded"
                                      style={{
                                        backgroundColor: config.bgColor,
                                        color: config.color,
                                      }}
                                    >
                                      {activity.stage_name}
                                    </span>
                                  </div>
                                )}

                                {activity.details && (
                                  <div className="mt-2 text-xs text-gray-600 bg-white rounded px-3 py-2">
                                    {activity.details}
                                  </div>
                                )}

                                {activity.duration_seconds &&
                                  activity.duration_seconds > 0 && (
                                    <div className="mt-2 text-xs text-gray-600">
                                      ⏱️ Duration:{" "}
                                      <span className="font-medium">
                                        {activity.duration}
                                      </span>
                                    </div>
                                  )}
                              </div>
                            </div>

                            {/* View Task Link */}
                            {activity.task_id && (
                              <Link
                                to={`/subtask/view/${activity.task_id}`}
                                className="flex-shrink-0 text-blue-600 hover:text-blue-700"
                              >
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
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

export default EmployeeActivityDashboard;
