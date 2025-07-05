import React from 'react';
import MyTimeTracking from '../components/MyTimeTracking';
import TaskTimeList from '../components/TaskTimeList';

const EmployeeTimeTracking = () => {
    return (
        <div className="employee-time-tracking">
            <MyTimeTracking />
            <TaskTimeList />
        </div>
    );
};

export default EmployeeTimeTracking;
