import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import LoadingOverlay from "./LoadingOverlay";
import { Link } from "react-router-dom";
import { stageOptions } from "../../options";

const DashboardSummaryCards = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [departmentCapacities, setDepartmentCapacities] = useState(null);
  const [capacityView, setCapacityView] = useState("monthlyWithSundays");
  const projectRef = useRef(null);
  const clientRef = useRef(null);
  const teamRef = useRef(null);
  const taskCompletedRef = useRef(null);
  const taskInProgressRef = useRef(null);
  const taskOverdueRef = useRef(null);

  const [capacityMode, setCapacityMode] = useState("time");
  const [viewOption, setViewOption] = useState("withoutSundays");

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
      <section className="md-total-card-main row">
        <div className="md-total-card-main-inner ">
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
        </div>
        <div className="md-total-card-main-inner">
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
                        ? "badge bg-success"
                        : stage === "Render"
                        ? "badge bg-info"
                        : ""
                    } `}
                  >
                    {count} {stage} Tasks Remaining
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
            <div className="mb-4 d-flex justify-content-between align-items-center">
              <div className="flex gap-2 mb-2">
                <button
                  className={`btn btn-sm m-2 ${
                    capacityMode === "time"
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => {
                    setCapacityMode("time");
                    setViewOption("withoutSundays");
                  }}
                >
                  Time to Complete Tasks
                </button>
                <button
                  className={`btn btn-sm m-2 ${
                    capacityMode === "employee"
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => {
                    setCapacityMode("employee");
                    setViewOption("daily");
                  }}
                >
                  Employee Capacity
                </button>
              </div>

              <div className="flex gap-2">
                {capacityMode === "time" ? (
                  <>
                    <button
                      className={`btn btn-sm m-2 ${
                        viewOption === "withSundays"
                          ? "btn-success"
                          : "btn-outline-success"
                      }`}
                      onClick={() => setViewOption("withSundays")}
                    >
                      With Sundays
                    </button>
                    <button
                      className={`btn btn-sm m-2 ${
                        viewOption === "withoutSundays"
                          ? "btn-success"
                          : "btn-outline-success"
                      }`}
                      onClick={() => setViewOption("withoutSundays")}
                    >
                      Without Sundays
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={`btn btn-sm m-2 ${
                        viewOption === "daily"
                          ? "btn-success"
                          : "btn-outline-success"
                      }`}
                      onClick={() => setViewOption("daily")}
                    >
                      Daily
                    </button>
                    <button
                      className={`btn btn-sm ${
                        viewOption === "monthlyWithSundays"
                          ? "btn-success"
                          : "btn-outline-success"
                      }`}
                      onClick={() => setViewOption("monthlyWithSundays")}
                    >
                      Monthly (With Sundays)
                    </button>
                    <button
                      className={`btn btn-sm m-2 ${
                        viewOption === "monthlyWithoutSundays"
                          ? "btn-success"
                          : "btn-outline-success"
                      }`}
                      onClick={() => setViewOption("monthlyWithoutSundays")}
                    >
                      Monthly (Without Sundays)
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {departmentCapacities &&
                Object.entries(departmentCapacities.departmentCapacities).map(
                  ([dept, data]) => {
                    let value = null;
                    let label = "";

                    if (capacityMode === "employee") {
                      if (viewOption === "daily") {
                        value = data.totalDailyCapacity;
                        label = "Units / day";
                      } else if (viewOption === "monthlyWithSundays") {
                        value = data.totalRemainingMonthlyCapacityWithSundays;
                        label = "Units this month (incl. Sundays)";
                      } else {
                        value =
                          data.totalRemainingMonthlyCapacityWithoutSundays;
                        label = "Units this month (excl. Sundays)";
                      }
                    } else {
                      const days =
                        viewOption === "withSundays"
                          ? data.estimatedDaysToComplete
                          : data.estimatedDaysToCompleteWithoutSundays; // You could implement an "estimatedDaysToCompleteWithoutSundays" if needed

                      value = days;
                      console.log("Estimated days for", dept, ":", days);
                      label = days
                        ? `~${days} ${
                            viewOption === "withSundays"
                              ? "calendar"
                              : "working"
                          } days to complete tasks`
                        : "Insufficient capacity";
                    }

                    return (
                      <div
                        key={dept}
                        className="p-2 rounded-xl shadow-md bg-white"
                      >
                        <div className="flex flex-col justify-between items-start">
                          <small className="font-semibold capitalize">
                            <span className="fw-bold"> {dept} </span>
                          </small>
                          <small className="text-sm text-gray-700">
                            {label === "Insufficient capacity" ? (
                              <span className="text-red-500">{label}</span>
                            ) : (
                              <>
                                {label}:{" "}
                                <strong>
                                  {value !== null ? value : "N/A"}
                                </strong>
                              </>
                            )}
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
