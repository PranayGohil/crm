import React, { useEffect } from "react";

// TODO: Replace with API call
const projectData = [
  {
    id: 1,
    title: "Modern Villa Design",
    client: "Sharma Enterprises",
    status: "In Progress",
    statusClass: "md-status-progress",
    progressColor: "cdn-bg-color-yellow",
    dateRange: "12 May 2025 – 20 May 2025",
    daysRemain: 1,
    completed: 60,
    total: 100,
    progress: 65,
    users: ["Image/user.jpg", "Image/user4.jpg", "Image/user2.jpg", "Image/user3.jpg"],
  },
  {
    id: 2,
    title: "Modern Villa Design",
    client: "Sharma Enterprises",
    status: "To do",
    statusClass: "md-status-todo",
    progressColor: "cdn-bg-color-blue",
    dateRange: "12 May 2025 – 20 May 2025",
    daysRemain: 1,
    completed: 60,
    total: 100,
    progress: 65,
    users: ["Image/user.jpg", "Image/user4.jpg", "Image/user3.jpg", "Image/user2.jpg"],
  },
  {
    id: 3,
    title: "Modern Villa Design",
    client: "Sharma Enterprises",
    status: "Done",
    statusClass: "md-status-completed",
    progressColor: "cdn-bg-color-green",
    dateRange: "12 May 2025 – 20 May 2025",
    daysRemain: 1,
    completed: 60,
    total: 100,
    progress: 65,
    users: ["Image/user3.jpg", "Image/user4.jpg", "Image/user2.jpg", "Image/user.jpg"],
  },
  {
    id: 4,
    title: "Modern Villa Design",
    client: "Sharma Enterprises",
    status: "Blocked",
    statusClass: "md-status-blocked",
    progressColor: "cdn-bg-color-red",
    dateRange: "12 May 2025 – 20 May 2025",
    daysRemain: 1,
    completed: 60,
    total: 100,
    progress: 65,
    users: ["Image/user.jpg", "Image/user.jpg", "Image/user.jpg", "Image/user.jpg"],
  },
  {
    id: 5,
    title: "Modern Villa Design",
    client: "Sharma Enterprises",
    status: "In Review",
    statusClass: "md-status-review",
    progressColor: "cdn-bg-color-purple",
    dateRange: "12 May 2025 – 20 May 2025",
    daysRemain: 1,
    completed: 60,
    total: 100,
    progress: 65,
    users: ["Image/user.jpg", "Image/user2.jpg", "Image/user3.jpg", "Image/user4.jpg"],
  },
];

const ClientAdminProjectListSection = () => {
  useEffect(() => {
    const inProgress = 30;
    const completed = 70;
    const overdue = 20;

    document.querySelector(".md-completed")?.style.setProperty("flex", completed);
    document.querySelector(".md-in_progress")?.style.setProperty("flex", inProgress);
    document.querySelector(".md-overdue")?.style.setProperty("flex", overdue);
  }, []);

  return (
    <section className="md-recent-main-project-main" id="ap-recent-main-project-main">
      <div className="md-recent-main-project-main-inner ap-recent-main-project-main-inner" id="ap-recent-main-project-main-inner">
        <div className="md-recent-project-card">
          {projectData.map((project, idx) => (
            <div className="md-project_card" key={idx}>
              <div className={`md-project_card__header_border ${project.progressColor}`}></div>
              <div className="md-project_card__content">
                <div className="md-project_card__top_row">
                  <h3 className="md-project_card__title">{project.title}</h3>
                  <span className={`md-status-btn ${project.statusClass}`}>{project.status}</span>
                </div>

                <div className="md-project_card__subtitle">
                  <p>{project.client}</p>
                  <div className="md-due-date-main">
                    <img src="SVG/time-due.svg" alt="due icon" />
                    <span>
                      <span>{project.daysRemain}</span> day remain
                    </span>
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
                  <div className="md-subtask-total-sub_number">
                    {project.completed}/{project.total}
                  </div>
                </div>

                <div className="md-project_card__progress_bar">
                  <div
                    className={`md-project_card__progress_fill ${project.progressColor}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>

                <div className="md-project_card__footer_row">
                  <div className="md-project_card__avatars">
                    <div className="md-user_avatars-img">
                      {project.users.map((user, i) => (
                        <img src={user} alt={`User ${i + 1}`} key={i} />
                      ))}
                    </div>
                  </div>
                  <span className="md-project_card__tasks_completed">Active Staff: 4</span>
                </div>

                <div className="md-project_card__button_wrap">
                  <a href="ClientAdminSubtaskShow" className="md-project_card__view_btn">View Subtask</a>
                  <a href="ClientAdminProjectContent" className="md-project_card__view_btn">View Content</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientAdminProjectListSection;
