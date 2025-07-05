import React from "react";

const ClientDetailsAndSummary = () => {
    // TODO: Replace with API call
    /*
    const taskSummary = {
      total: 12,
      done: 10,
      percentComplete: 83,
      stats: [
        { label: "Total Tasks Assigned", count: 10 },
        { label: "Tasks To Do", count: 3 },
        { label: "Tasks In Progress", count: 8 },
        { label: "Tasks Paused", count: 3 },
        { label: "Tasks Blocked", count: 3 },
        { label: "Tasks Done", count: 6 }
      ]
    };
    */

    return (
        <section className="mi_24">
            <div className="cdl-sec3">
                <div className="cdl-sec3-inner">
                    <div className="cdl-sec3-heading">
                        <img src="/SVG/menu-css.svg" alt="meun" />
                        <p> Task Summary</p>
                    </div>

                    <div className="cdl-processbar cd-progress_bar">
                        <div className="cd-pr_bar-txt">
                            <p>
                                Total Tasks: <span style={{ color: "#374151" }}>12</span> /{" "}
                                <span style={{ color: "#374151" }}>10</span> Done
                            </p>
                            <span>83%</span>
                        </div>
                        <div className="cd-progress_container">
                            <div
                                className="cd-progress"
                                style={{ width: "83%", backgroundColor: "#10B981" }}
                            ></div>
                        </div>
                    </div>

                    <div className="cdl-task-details">
                        <div className="cdl-tasks cdl-task1">
                            <p>Total Tasks Assigned</p>
                            <span className="assignd-task-num task-num">10</span>
                        </div>
                        <div className="cdl-tasks cdl-task1">
                            <p>Tasks To Do</p>
                            <span className="task-pending-num task-num">3</span>
                        </div>
                        <div className="cdl-tasks cdl-task1">
                            <p>Tasks In Progress</p>
                            <span className="task-inprogress-num task-num">8</span>
                        </div>
                        <div className="cdl-tasks cdl-task1">
                            <p>Tasks Paused</p>
                            <span className="task-paused-num task-num">3</span>
                        </div>
                        <div className="cdl-tasks cdl-task1">
                            <p>Tasks Blocked</p>
                            <span className="task-blocked-num task-num">3</span>
                        </div>
                        <div className="cdl-tasks cdl-task1">
                            <p>Tasks Done</p>
                            <span className="task-complete-num task-num">6</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ClientDetailsAndSummary;
