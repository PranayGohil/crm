import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ProjectCard = ({
  filteredProjects,
  projectSubtasks,
  loading,
  employees,
}) => {
  const [clientMap, setClientMap] = useState({});

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Calculate days remaining
  const calculateDaysRemaining = (dueDate) => {
    if (!dueDate) return "-";

    const today = new Date();
    const due = new Date(dueDate);
    const timeDiff = due.getTime() - today.getTime();
    const daysRemain = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysRemain < 0) return "Overdue";
    if (daysRemain === 0) return "Due today";
    return `${daysRemain} day${daysRemain !== 1 ? "s" : ""} remain`;
  };

  useEffect(() => {
    const fetchClients = async () => {
      const ids = [
        ...new Set(filteredProjects.map((p) => p.client_id).filter(Boolean)),
      ];
      if (!ids.length) return;

      try {
        const results = await Promise.all(
          ids.map((id) =>
            axios
              .get(`${process.env.REACT_APP_API_URL}/api/client/get/${id}`)
              .then((res) => ({ id, name: res.data.full_name }))
              .catch(() => ({ id, name: "Unknown Client" }))
          )
        );

        const map = {};
        results.forEach((r) => (map[r.id] = r.name));
        setClientMap(map);
      } catch (err) {
        console.error("Error fetching clients", err);
      }
    };

    fetchClients();
  }, [filteredProjects]);

  // Get status class for styling
  const getStatusClass = (status) => {
    if (!status) return "status-default";

    const statusMap = {
      "to do": "status-pending",
      "in progress": "status-in-progress",
      "in review": "status-in-progress",
      block: "status-overdue",
      done: "status-completed",
      completed: "status-completed",
    };

    return statusMap[status.toLowerCase()] || "status-default";
  };

  return (
    <div className="projects-grid">
      {filteredProjects.length === 0 && !loading && (
        <div className="no-projects">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <p>No projects found matching your criteria.</p>
        </div>
      )}

      {filteredProjects.map((project) => {
        const subtasks = projectSubtasks[project._id] || [];
        const employeeIds = Array.from(
          new Set(subtasks.map((t) => t.assign_to).filter(Boolean))
        );
        const completedCount = subtasks.filter(
          (t) => t.status?.toLowerCase() === "completed"
        ).length;
        const progressPercent = subtasks.length
          ? Math.round((completedCount / subtasks.length) * 100)
          : 0;
        const daysRemain = calculateDaysRemaining(project.due_date);
        const statusClass = getStatusClass(project.status);

        return (
          <div className="project-card" key={project._id}>
            <div className="project-card-header">
              <h3 className="project-title">{project.project_name}</h3>
              <span className={`status-badge ${statusClass}`}>
                <span className="status-dot"></span>
                {project.status || "To do"}
              </span>
            </div>

            <div className="project-client">
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>{clientMap[project.client_id] || "No Client"}</span>
            </div>

            <div className="project-dates flex sm:flex-row flex-col gap-2">
              <div className="date-range">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>
                  {formatDate(project.assign_date)} –{" "}
                  {formatDate(project.due_date)}
                </span>
              </div>
              <div
                className={`days-remaining ${
                  daysRemain === "Overdue" ? "overdue" : ""
                }`}
              >
                {daysRemain}
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-header">
                <span>Subtasks Completed</span>
                <span className="progress-count">
                  {completedCount}/{subtasks.length}
                </span>
              </div>
              <div className="progress-bar border">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="project-team">
              <div className="team-members">
                {employeeIds.slice(0, 3).map((id, index) => {
                  const emp = employees[id];
                  const firstLetter =
                    emp?.full_name?.charAt(0).toUpperCase() || "?";

                  return emp?.profile_pic ? (
                    <img
                      key={id}
                      src={emp.profile_pic}
                      alt={emp.full_name || "Employee"}
                      className="team-avatar"
                      style={{
                        zIndex: 3 - index,
                        marginLeft: index === 0 ? 0 : -10,
                      }}
                    />
                  ) : (
                    <div
                      key={id}
                      className="team-avatar placeholder"
                      style={{
                        zIndex: 3 - index,
                        marginLeft: index === 0 ? 0 : -10,
                      }}
                    >
                      {firstLetter}
                    </div>
                  );
                })}
                {employeeIds.length > 3 && (
                  <div className="team-avatar more-members">
                    +{employeeIds.length - 3}
                  </div>
                )}
              </div>
              <span className="team-count">
                {employeeIds.length} team members
              </span>
            </div>

            <div className="project-actions">
              <Link
                to={`/subtasks/${project._id}`}
                className="action-btn view-btn"
              >
                View Subtasks
              </Link>
              <Link
                to={`/project-details/${project._id}`}
                className="action-btn primary-btn"
              >
                View Project
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectCard;
