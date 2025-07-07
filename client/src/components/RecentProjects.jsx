import React, { useEffect, useState } from "react";
import axios from "axios";

const RecentProjects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/statistics/recent-projects`)
      .then((res) => setProjects(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <section className="md-recent-main-project-main">
      <div className="md-recent-main-project-main-inner">
        {/* Header */}
        <div className="md-recent-project-main-header">
          <span>Recent Projects</span>
          <div className="md-all-project-btn">
            <a href="AddNewProject">
              <img src="SVG/plues.svg" alt="plus" /> New Project
            </a>
            <a href="createnewclient">
              <img src="SVG/add-member.svg" alt="plus" /> New Client
            </a>
          </div>
        </div>

        {/* Cards */}
        <div className="md-recent-project-card">
          {projects.length === 0 && <div>Loading projects...</div>}
          {projects.map((project, index) => {
            const colorClass =
              project.status === "Completed"
                ? "cdn-bg-color-green"
                : project.status === "In Progress"
                ? "cdn-bg-color-yellow"
                : project.status === "To Do"
                ? "cdn-bg-color-blue"
                : "cdn-bg-color-red";

            // Dummy avatars (replace with real staff later)
            const avatars = [
              "Image/user.jpg",
              "Image/user2.jpg",
              "Image/user3.jpg",
            ];

            // Fake progress (later, you can calculate real)
            const progress = 65;

            return (
              <div className="md-project_card" key={index}>
                <div
                  className={`md-project_card__header_border ${colorClass}`}
                ></div>
                <div className="md-project_card__content">
                  <div className="md-project_card__top_row">
                    <h3 className="md-project_card__title">
                      {project.project_name}
                    </h3>
                    <span
                      className={`md-status-btn ${
                        project.status === "Completed"
                          ? "md-status-completed"
                          : project.status === "In Progress"
                          ? "md-status-progress"
                          : project.status === "To Do"
                          ? "md-status-todo"
                          : "md-status-blocked"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <div className="md-project_card__subtitle">
                    <p>{project.client_name || "Unknown Client"}</p>
                    <div className="md-due-date-main">
                      <img src="SVG/time-due.svg" alt="due icon" />
                      <span>
                        {project.due_date
                          ? `${Math.ceil(
                              (new Date(project.due_date) - new Date()) /
                                (1000 * 60 * 60 * 24)
                            )} days remain`
                          : "No due date"}
                      </span>
                    </div>
                  </div>

                  <div className="md-project_card__date_row">
                    <div className="md-project_card__date">
                      <img src="SVG/calendar.svg" alt="calendar" />
                      <span>
                        {project.assign_date
                          ? `${new Date(
                              project.assign_date
                            ).toLocaleDateString()} – ${new Date(
                              project.due_date
                            ).toLocaleDateString()}`
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="md-project-card__subtask_text">
                    <div className="md-subtask-text">Subtasks Completed</div>
                    <div className="md-subtask-total-sub_number">60/100</div>
                  </div>

                  <div className="md-project_card__progress_bar">
                    <div
                      className={`md-project_card__progress_fill ${colorClass}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <div className="md-project_card__footer_row">
                    <div className="md-project_card__avatars">
                      <div className="md-user_avatars-img">
                        {avatars.map((avatar, i) => (
                          <img src={avatar} alt={`User ${i + 1}`} key={i} />
                        ))}
                      </div>
                    </div>
                    <span className="md-project_card__tasks_completed">
                      Active Staff: {avatars.length}
                    </span>
                  </div>

                  <div className="md-project_card__button_wrap">
                    <a
                      href="subtaskdashboardcontainer"
                      className="md-project_card__view_btn"
                    >
                      View Subtasks
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RecentProjects;
