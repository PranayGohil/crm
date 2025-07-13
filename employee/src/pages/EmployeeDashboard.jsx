import React from 'react';
import TaskBoardHeader from '../components/TaskBoardHeader';
import TaskSummaryBoxes from '../components/TaskSummaryBoxes';
import ProjectTaskTable from '../components/ProjectTaskTable';

const EmployeeDashboard = () => {
    return (
        <div className="employee-dashboard">
            <TaskBoardHeader />
            <TaskSummaryBoxes />
            <ProjectTaskTable />
        </div>
    );
};

export default EmployeeDashboard;
