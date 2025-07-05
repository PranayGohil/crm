import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ActiveProjectCards = ({ selectedClient, selectedStatus }) => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [projectSubtasks, setProjectSubtasks] = useState({});

  useEffect(() => {
    const fetchProjectsAndSubtasks = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/project/get-all`
        );
        setProjects(res.data);

        // Fetch subtasks for each project
        const subtaskPromises = res.data.map(async (project) => {
          const subtasksRes = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/subtask/project/${project._id}`
          );
          return { projectId: project._id, subtasks: subtasksRes.data };
        });

        const subtaskResults = await Promise.all(subtaskPromises);

        // Map: { projectId: subtasks[] }
        const subtasksMap = {};
        subtaskResults.forEach(({ projectId, subtasks }) => {
          subtasksMap[projectId] = subtasks;
        });
        setProjectSubtasks(subtasksMap);
      } catch (error) {
        console.error("Error fetching projects or subtasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsAndSubtasks();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const clientMatch =
      selectedClient === "All Client" || project.client_name === selectedClient;
    const statusMatch =
      selectedStatus === "All Status" || project.status === selectedStatus;
    return clientMatch && statusMatch;
  });

  if (loading)
    return <p style={{ textAlign: "center" }}>Loading projects...</p>;

  return (
    <section
      className="md-recent-main-project-main"
      id="ap-recent-main-project-main"
    >
      <div className="md-recent-main-project-main-inner ap-recent-main-project-main-inner">
        <div className="md-recent-project-card">
          {filteredProjects.map((project, idx) => {
            const dueDate = project.due_date
              ? new Date(project.due_date)
              : null;
            const today = new Date();
            const daysRemain = dueDate
              ? Math.max(
                  Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24)),
                  0
                )
              : "-";

            const subtasks = projectSubtasks[project._id] || [];
            const totalSubtasks = subtasks.length;
            const completedSubtasks = subtasks.filter(
              (task) => task.status?.toLowerCase() === "completed"
            ).length;
            const progressPercent = totalSubtasks
              ? Math.round((completedSubtasks / totalSubtasks) * 100)
              : 0;
            return (
              <div className="md-project_card" key={idx}>
                <div
                  className={`md-project_card__header_border cdn-bg-color-blue`}
                ></div>
                <div className="md-project_card__content">
                  <div className="md-project_card__top_row">
                    <h3 className="md-project_card__title">
                      {project.project_name}
                    </h3>
                    <span
                      className={`md-status-btn md-status-${project.status?.toLowerCase()}`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <div className="md-project_card__subtitle">
                    <p>{project.client_name}</p>
                    <div className="md-due-date-main">
                      <img src="SVG/time-due.svg" alt="due icon" />
                      <span>
                        <span>{daysRemain}</span> day remain
                      </span>
                    </div>
                  </div>
                  <div className="md-project_card__date_row">
                    <div className="md-project_card__date">
                      <img src="SVG/calendar.svg" alt="calendar" />
                      <span>
                        {project.assign_date?.substring(0, 10)} –{" "}
                        {project.due_date?.substring(0, 10)}
                      </span>
                    </div>
                  </div>
                  <div className="md-project-card__subtask_text">
                    <div className="md-subtask-text">Subtasks Completed</div>
                    <div className="md-subtask-total-sub_number">
                      {completedSubtasks}/{totalSubtasks}
                    </div>
                  </div>
                  <div className="md-project_card__progress_bar">
                    <div
                      className={`md-project_card__progress_fill cdn-bg-color-blue`}
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <div className="md-project_card__footer_row">
                    <div className="md-project_card__avatars">
                      <div className="md-user_avatars-img">
                        {/* Dummy users or load later */}
                        <img src="Image/user.jpg" alt="User" />
                      </div>
                    </div>
                    <span className="md-project_card__tasks_completed">
                      Active Staff: {project.asign_to?.length || 0}
                    </span>
                  </div>
                  <div className="md-project_card__button_wrap">
                    <Link
                      to={`/subtaskdashboardcontainer/${project._id}`}
                      className="md-project_card__view_btn"
                    >
                      View Subtask
                    </Link>
                    <Link
                      to={`projectcontent`}
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

export default ActiveProjectCards;
