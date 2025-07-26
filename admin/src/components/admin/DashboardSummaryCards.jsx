import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import LoadingOverlay from "./LoadingOverlay";
import { Link } from "react-router-dom";
import { stageOptions } from "../../options";

const DashboardSummaryCards = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [departmentCapacities, setDepartmentCapacities] = useState(null);
  const [capacityView, setCapacityView] = useState("monthlyWithSundays"); // Options: daily, monthlyWithSundays, monthlyWithoutSundays
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

    axios
      .get(
        `${process.env.REACT_APP_API_URL}/api/statistics/department-capacities`
      )
      .then((res) => {
        console.log(res.data);
        setDepartmentCapacities(res.data);
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
    <>
      <section className="md-total-card-main">
        <div className="md-total-card-main-inner">
          {/* Total Projects */}
          <Link to="/project/dashboard" className="md-common-total-card">
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
            {/* <div className="md-ongoing-completed mt-8">
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
          </div> */}
          </Link>

          {/* Total Clients */}
          <Link to="/client/dashboard" className="md-common-total-card">
            <div className="md-common-para-icon md-para-icon-client">
              <span>Total Clients</span>
              <div className="md-common-icon">
                <img src="SVG/d-client.svg" alt="total clients" />
              </div>
            </div>
            <div className="md-total-project-number">
              <span className="md-total-card-number">
                {summary.totalClients}
              </span>
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
            {/* <div className="md-progress_container">
            <div
              className="md-progress_fill md-progress_fill-color-clients"
              ref={clientRef}
            ></div>
          </div> */}
          </Link>

          {/* Tasks */}
          <Link to="/subtasks" className="md-common-total-card">
            <div className="md-common-para-icon md-para-icon-tasks">
              <span>Subtasks</span>
              <div className="md-common-icon">
                <img src="SVG/true-green.svg" alt="total tasks" />
              </div>
            </div>
            <div className="md-total-project-number">
              <span className="md-total-card-number">{summary.totalTasks}</span>
              <span className="md-total-card-text">Total</span>
            </div>
            <div className="mt-8 md-btn-cio">
              {summary.tasksByStage &&
                Object.entries(summary.tasksByStage).map(([stage, count]) => (
                  <div
                    key={stage}
                    className={`${
                      stage === "CAD Design"
                        ? "badge bg-primary"
                        : stage === "SET Design"
                        ? "badge bg-warning"
                        : stage === "Delivery"
                        ? "badge bg-success"
                        : stage === "Render"
                        ? "badge bg-info"
                        : ""
                    } `}
                  >
                    {count} {stage}
                  </div>
                ))}
            </div>
          </Link>

          <div className="md-common-total-card">
            <div className="md-common-para-icon md-para-icon-tasks">
              <span>Department Capacity</span>
              <div>
                <img src="SVG/icon-4.svg" alt="total tasks" />
              </div>
            </div>
            <div className="mb-4 flex items-center gap-2">
              <span htmlFor="capacityFilter"></span>
              <select
                id="capacityFilter"
                value={capacityView}
                onChange={(e) => setCapacityView(e.target.value)}
                className="form-select"
              >
                <option value="daily">Daily</option>
                <option value="monthlyWithSundays">
                  Remaining Month (incl. Sundays)
                </option>
                <option value="monthlyWithoutSundays">
                  Remaining Month (excl. Sundays)
                </option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {departmentCapacities &&
                Object.entries(departmentCapacities.departmentCapacities).map(
                  ([dept, data]) => {
                    const value =
                      capacityView === "daily"
                        ? data.totalDailyCapacity
                        : capacityView === "monthlyWithSundays"
                        ? data.totalRemainingMonthlyCapacityWithSundays
                        : data.totalRemainingMonthlyCapacityWithoutSundays;

                    return (
                      <div
                        key={dept}
                        className="p-2 rounded-xl shadow-md bg-white"
                      >
                        <div className="flex justify-between items-center">
                          <small className="font-semibold capitalize">
                            <span className="fw-bold"> {dept} </span> ~{value}{" "}
                            Units (from Tomorrow)
                          </small>
                        </div>
                      </div>
                    );
                  }
                )}
            </div>
          </div>
        </div>
      </section>
      <section className="md-total-card-main mt-6">
        <h3 className="text-xl font-semibold mb-2"></h3>
      </section>
    </>
  );
};

export default DashboardSummaryCards;
