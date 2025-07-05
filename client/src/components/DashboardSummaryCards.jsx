import React, { useEffect, useRef } from "react";

const DashboardSummaryCards = () => {
  const projectRef = useRef(null);
  const clientRef = useRef(null);
  const teamRef = useRef(null);
  const taskCompletedRef = useRef(null);
  const taskInProgressRef = useRef(null);
  const taskOverdueRef = useRef(null);

  useEffect(() => {
    // === Progress Bar Calculations ===
    const setProgress = (ref, ongoing, completed) => {
      const total = ongoing + completed;
      const percent = (ongoing / total) * 100;
      if (ref.current) {
        ref.current.style.width = percent + "%";
      }
    };

    // Apply progress bars
    setProgress(projectRef, 12, 5);
    setProgress(clientRef, 24, 2);
    setProgress(teamRef, 8, 2);

    // Task bar flex settings
    if (
      taskCompletedRef.current &&
      taskInProgressRef.current &&
      taskOverdueRef.current
    ) {
      taskCompletedRef.current.style.flex = 70;
      taskInProgressRef.current.style.flex = 30;
      taskOverdueRef.current.style.flex = 20;
    }
  }, []);

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
            <span className="md-total-card-number">17</span>
            <span className="md-total-card-text">Project</span>
          </div>
          <div className="md-ongoing-completed mt-8">
            <span className="md-ongoing-number">12</span>
            <span>Ongoing</span>
            <span>/</span>
            <span className="md-completed-number">5</span>
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
            <span className="md-total-card-number">24</span>
            <span className="md-total-card-text">Clients</span>
          </div>
          <div className="mt-8">
            <div className="md-up-arrow-grenn">
              <img src="SVG/up-arrow-green.svg" alt="up arrow green" />
              <div>
                <span>2</span> new this month
              </div>
            </div>
          </div>
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
            <span className="md-total-card-number">120</span>
            <span className="md-total-card-text">Total</span>
          </div>
          <div className="mt-8 md-btn-cio">
            <div className="md-btn-completed">
              <span>30</span> completed
            </div>
            <div className="md-btn-in_progress">
              <span>70</span> In progress
            </div>
            <div className="md-btn-overdue">
              <span>30</span> Overdue
            </div>
          </div>
          <div className="md-progress_bar-second">
            <div className="md-bar md-completed" ref={taskCompletedRef}></div>
            <div className="md-bar md-in_progress" ref={taskInProgressRef}></div>
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
            <span className="md-total-card-number">10</span>
            <span className="md-total-card-text">Members</span>
          </div>
          <div className="md-ongoing-completed mt-8">
            <span>Active Today: </span>
            <span>8</span>
            <span>/</span>
            <span>10</span>
          </div>
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
