import React from 'react';

// TODO: Replace with API call
// const summaryData = {
const summaryData = {
    mainTasks: 5,
    subtasks: 12,
    totalTimeTracked: '17:30:00'
};

const TaskSummary = () => {
    return (
        <section className="tt-showing-task-detail">
            <div className="tt-showing-task">
                <p>Showing <span>{summaryData.mainTasks}</span> main tasks</p>
                <p>( <span>{summaryData.subtasks}</span> subtasks total)</p>
            </div>
            <div className="tt-showing-time-tracking">
                <p>Total time tracked this week:</p>
                <span>{summaryData.totalTimeTracked}</span>
            </div>
        </section>
    );
};

export default TaskSummary;

