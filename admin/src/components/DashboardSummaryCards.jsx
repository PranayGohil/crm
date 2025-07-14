import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import LoadingOverlay from "../components/admin/LoadingOverlay";

const DashboardSummaryCards = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const projectRef = useRef(null);
  const clientRef = useRef(null);
  const teamRef = useRef(null);
  const taskCompletedRef = useRef(null);
  const taskInProgressRef = useRef(null);
  const taskOverdueRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/statistics/summary`)
      .then((res) => {
        setSummary(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (summary) {
      const setProgress = (ref, ongoing, completed) => {
        const total = ongoing + completed;
        const percent = total ? (ongoing / total) * 100 : 0;
        if (ref.current) {
          ref.current.style.width = percent + "%";
        }
      };

      setProgress(projectRef, summary.totalProjects, summary.completedTasks);
      setProgress(clientRef, summary.totalClients, 0);
      setProgress(teamRef, summary.totalEmployees, 0);

      if (
        taskCompletedRef.current &&
        taskInProgressRef.current &&
        taskOverdueRef.current
      ) {
        taskCompletedRef.current.style.flex = summary.completedTasks;
        taskInProgressRef.current.style.flex = summary.inProgressTasks;
        taskOverdueRef.current.style.flex = summary.overdueTasks;
      }
    }
  }, [summary]);

  if (!summary || loading) return <LoadingOverlay />;

  return (
    <section className="md-total-card-main">
      <div className="md-total-card-main-inner">
        {/* Total Projects */}
        <div className="md-common-total-card">
          <div className="md-common-para-icon">
            <span>Total Project</span>
            <div className="md-common-icon">
              <img src="SVG/project-file.svg" alt="total project" />
            </div>
          </div>
          <div className="md-total-project-number">
            <span className="md-total-card-number">
              {summary.totalProjects}
            </span>
            <span className="md-total-card-text">Project</span>
          </div>
          <div className="md-ongoing-completed mt-8">
            <span className="md-ongoing-number">
              {summary.inProgressTasks}{" "}
            </span>
            <span>Ongoing</span>
            <span>/</span>
            <span className="md-completed-number">
              {summary.completedTasks}{" "}
            </span>
            <span>Completed</span>
          </div>
          <div className="md-progress_container">
            <div
              className="md-progress_fill md-progress_fill-color-projects"
              ref={projectRef}
            ></div>
          </div>
        </div>

        {/* Total Clients */}
        <div className="md-common-total-card">
          <div className="md-common-para-icon md-para-icon-client">
            <span>Total Clients</span>
            <div className="md-common-icon">
              <img src="SVG/d-client.svg" alt="total clients" />
            </div>
          </div>
          <div className="md-total-project-number">
            <span className="md-total-card-number">{summary.totalClients}</span>
            <span className="md-total-card-text">Clients</span>
          </div>
          {/* <div className="mt-8">
            <div className="md-up-arrow-grenn">
              <img src="SVG/up-arrow-green.svg" alt="up arrow green" />
              <div>
                <span>+2</span> new this month
              </div>
            </div>
          </div> */}
          <div className="md-progress_container">
            <div
              className="md-progress_fill md-progress_fill-color-clients"
              ref={clientRef}
            ></div>
          </div>
        </div>

        {/* Tasks */}
        <div className="md-common-total-card">
          <div className="md-common-para-icon md-para-icon-tasks">
            <span>Tasks</span>
            <div className="md-common-icon">
              <img src="SVG/true-green.svg" alt="total tasks" />
            </div>
          </div>
          <div className="md-total-project-number">
            <span className="md-total-card-number">
              {summary.completedTasks +
                summary.inProgressTasks +
                summary.overdueTasks}
            </span>
            <span className="md-total-card-text">Total</span>
          </div>
          <div className="mt-8 md-btn-cio">
            <div className="md-btn-completed">
              <span>{summary.completedTasks}</span> completed
            </div>
            <div className="md-btn-in_progress">
              <span>{summary.inProgressTasks}</span> In progress
            </div>
            <div className="md-btn-overdue">
              <span>{summary.overdueTasks}</span> Overdue
            </div>
          </div>
          <div className="md-progress_bar-second">
            <div className="md-bar md-completed" ref={taskCompletedRef}></div>
            <div
              className="md-bar md-in_progress"
              ref={taskInProgressRef}
            ></div>
            <div className="md-bar md-overdue" ref={taskOverdueRef}></div>
          </div>
        </div>

        {/* Team Members */}
        <div className="md-common-total-card">
          <div className="md-common-para-icon md-para-icon-team">
            <span>Team Members</span>
            <div className="md-common-icon">
              <img src="SVG/team-yellow.svg" alt="team members" />
            </div>
          </div>
          <div className="md-total-project-number">
            <span className="md-total-card-number">
              {summary.totalEmployees}
            </span>
            <span className="md-total-card-text">Members</span>
          </div>
          {/* <div className="md-ongoing-completed mt-8">
            <span>Active Today: </span>
            <span>8</span>
            <span>/</span>
            <span>{summary.totalEmployees}</span>
          </div> */}
          <div className="md-progress_container">
            <div
              className="md-progress_fill md-progress_fill-color-team"
              ref={teamRef}
            ></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardSummaryCards;
