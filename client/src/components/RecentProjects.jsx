import React from "react";
import { Link } from "react-router-dom";




const RecentProjects = () => {
  const projects = [
    {
      id: 1,
      title: "Modern Villa Design",
      client: "Sharma Enterprises",
      due: "1 day remain",
      dateRange: "12 May 2025 – 20 May 2025",
      status: "In Progress",
      statusClass: "md-status-progress",
      colorClass: "cdn-bg-color-yellow",
      progress: 65,
      avatars: ["Image/user.jpg", "Image/user4.jpg", "Image/user2.jpg", "Image/user3.jpg"]
    },
    {
      id: 2,
      title: "Modern Villa Design",
      client: "Sharma Enterprises",
      due: "1 day remain",
      dateRange: "12 May 2025 – 20 May 2025",
      status: "To do",
      statusClass: "md-status-todo",
      colorClass: "cdn-bg-color-blue",
      progress: 65,
      avatars: ["Image/user.jpg", "Image/user4.jpg", "Image/user3.jpg", "Image/user2.jpg"]
    },
    {
      id: 3,
      title: "Modern Villa Design",
      client: "Sharma Enterprises",
      due: "1 day remain",
      dateRange: "12 May 2025 – 20 May 2025",
      status: "Done",
      statusClass: "md-status-completed",
      colorClass: "cdn-bg-color-green",
      progress: 65,
      avatars: ["Image/user3.jpg", "Image/user4.jpg", "Image/user2.jpg", "Image/user.jpg"]
    },
    {
      id: 4,
      title: "Modern Villa Design",
      client: "Sharma Enterprises",
      due: "1 day remain",
      dateRange: "12 May 2025 – 20 May 2025",
      status: "Blocked",
      statusClass: "md-status-blocked",
      colorClass: "cdn-bg-color-red",
      progress: 65,
      avatars: ["Image/user.jpg", "Image/user.jpg", "Image/user.jpg", "Image/user.jpg"]
    }
  ];


  return (
    <section className="md-recent-main-project-main">
      <div className="md-recent-main-project-main-inner">
        {/* Header */}
        <div className="md-recent-project-main-header">
          <span>Recent Projects</span>
          <div className="md-all-project-btn">
            <a href="AddNewProject">
              <img src="SVG/plues.svg" alt="plus" />
              New Project
            </a>
            <a href="createnewclient">
              <img src="SVG/add-member.svg" alt="plus" />
              New Client
            </a>
          </div>
        </div>

        {/* Cards */}
        <div className="md-recent-project-card">
          {projects.map((project, index) => (
            <div className="md-project_card" key={index}>
              <div className={`md-project_card__header_border ${project.colorClass}`}></div>

              <div className="md-project_card__content">
                <div className="md-project_card__top_row">
                  <h3 className="md-project_card__title">{project.title}</h3>
                  <span className={`md-status-btn ${project.statusClass}`}>
                    {project.status}
                  </span>
                </div>

                <div className="md-project_card__subtitle">
                  <p>{project.client}</p>
                  <div className="md-due-date-main">
                    <img src="SVG/time-due.svg" alt="due icon" />
                    <span>{project.due}</span>
                  </div>
                </div>

                <div className="md-project_card__date_row">
                  <div className="md-project_card__date">
                    <img src="SVG/calendar.svg" alt="calendar" />
                    <span>{project.dateRange}</span>
                  </div>
                </div>

                <div className="md-project-card__subtask_text">
                  <div className="md-subtask-text">Subtasks Completed</div>
                  <div className="md-subtask-total-sub_number">60/100</div>
                </div>

                <div className="md-project_card__progress_bar">
                  <div
                    className={`md-project_card__progress_fill ${project.colorClass}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>

                <div className="md-project_card__footer_row">
                  <div className="md-project_card__avatars">
                    <div className="md-user_avatars-img">
                      {project.avatars.map((avatar, i) => (
                        <img src={avatar} alt={`User ${i + 1}`} key={i} />
                      ))}
                    </div>
                  </div>
                  <span className="md-project_card__tasks_completed">
                    Active Staff: {project.avatars.length}
                  </span>
                </div>

                <div className="md-project_card__button_wrap">
                  {/* <Link to={`/project/${project.id}`} className="md-project_card__view_btn">
                    View Subtask
                  </Link> */}
                      <a href="subtaskdashboardcontainer" className="md-project_card__view_btn">
                    View Subtasks
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentProjects;
