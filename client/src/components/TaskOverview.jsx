import React from 'react';

const TaskOverview = () => {
    return (
        <section className="pb-sec-4 pb-sec2">
            <div className="pb-sec4-inner pb-sec3-inner">
                <div className="pb-task-overview-head">
                    <p>Task Overview</p>
                </div>
                <div className="pb-task-overview-inner">
                    <div className="pb-task-view overview1">
                        <div className="pb-taskinner">
                            <p>Stage:</p>
                            <span>CAD Design</span>
                        </div>
                        <div className="pb-taskinner">
                            <p>Assigned To:</p>
                            <span>Michael Chen</span>
                        </div>
                        <div className="pb-taskinner">
                            <p>Start Date:</p>
                            <span>Sep 15, 2023</span>
                        </div>
                        <div className="pb-taskinner">
                            <p>Due Date:</p>
                            <span>Sep 22, 2023</span>
                        </div>
                    </div>
                    <div className="pb-task-view overview2">
                        <div className="pb-taskinner">
                            <p>Created By:</p>
                            <span>Emma Davis</span>
                        </div>
                        <div className="pb-taskinner">
                            <p>Status:</p>
                            <span>Awaiting Review</span>
                        </div>
                        <div className="pb-taskinner">
                            <p>Completion:</p>
                            <span className="pb-process-span">
                                <div className="cd-progress_container">
                                    <div
                                        className="cd-progress"
                                        style={{ width: '83%', backgroundColor: '#10B981' }}
                                    ></div>
                                </div>
                                83%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TaskOverview;
