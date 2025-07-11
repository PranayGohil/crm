import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ProjectCard = ({ filteredProjects, projectSubtasks, loading }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear().toString();
    return `${day} ${month} ${year}`;
  };
  
  return (
    <section className="md-recent-main-project-main">
      <div className="md-recent-main-project-main-inner">
        <div className="md-recent-project-card">
          {filteredProjects.length === 0 && !loading && (
            <p style={{ textAlign: "center", marginTop: "20px" }}>
              No projects found.
            </p>
          )}
          {filteredProjects.map((project, idx) => {
            const dueDate = project.due_date
              ? new Date(project.due_date)
              : null;
            const daysRemain = dueDate
              ? Math.max(
                  Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24)),
                  0
                )
              : "-";

            const subtasks = projectSubtasks[project._id] || [];
            const completedSubtasks = subtasks.filter(
              (t) => t.status?.toLowerCase() === "completed"
            ).length;
            const progressPercent = subtasks.length
              ? Math.round((completedSubtasks / subtasks.length) * 100)
              : 0;

            return (
              <div className="md-project_card" key={idx}>
                <div className="md-project_card__header_border cdn-bg-color-blue"></div>
                <div className="md-project_card__content">
                  <div className="md-project_card__top_row">
                    <h3 className="md-project_card__title">
                      {project.project_name}
                    </h3>
                    <span
                      className={`md-status-btn md-status-${
                        project.status?.toLowerCase() || "todo"
                      }`}
                    >
                      {project.status || "To do"}
                    </span>
                  </div>
                  <div className="md-project_card__subtitle">
                    <p>{project.client_name}</p>
                    <div className="md-due-date-main">
                      <img src="/SVG/time-due.svg" alt="due" />
                      <span>{daysRemain} day remain</span>
                    </div>
                  </div>
                  <div className="md-project_card__date_row">
                    <div className="md-project_card__date">
                      <img src="/SVG/calendar.svg" alt="calendar" />
                      <span>
                        {formatDate(project.assign_date?.substring(0, 10))} –{" "}
                        {formatDate(project.due_date?.substring(0, 10))}
                      </span>
                    </div>
                  </div>
                  <div className="md-project-card__subtask_text">
                    <div className="md-subtask-text">Subtasks Completed</div>
                    <div className="md-subtask-total-sub_number">
                      {completedSubtasks}/{subtasks.length}
                    </div>
                  </div>
                  <div className="md-project_card__progress_bar">
                    <div
                      className="md-project_card__progress_fill cdn-bg-color-blue"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <div className="md-project_card__footer_row">
                    <div className="md-project_card__avatars">
                      <img
                        src="/Image/user.jpg"
                        alt="User"
                        width={40}
                        height={40}
                        style={{ borderRadius: "50%" }}
                      />
                    </div>
                    <span className="md-project_card__tasks_completed">
                      Active Staff: {project.asign_to?.length || 0}
                    </span>
                  </div>
                  <div className="md-project_card__button_wrap">
                    <Link
                      to={`/project/subtask-dashboard/${project._id}`}
                      className="md-project_card__view_btn"
                    >
                      View Subtask
                    </Link>
                    <Link
                      to={`/project/view-content/${project._id}`}
                      className="md-project_card__view_btn"
                    >
                      View Content
                    </Link>
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

export default ProjectCard;
