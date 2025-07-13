import React from 'react';
import EttMainSection from '../components/EttMainSection';
import EttTaskTime from '../components/EttTaskTime';
import TaskSummary from '../components/TaskSummary';
import TeamSummary from '../components/TeamSummary';

const TimeTrackingDashboard = () => {
    return (
        <div className="time-tracking-dashboard-page">

            <EttMainSection />
            <EttTaskTime />
            <TaskSummary />
            <TeamSummary />

        </div>
    );
};

export default TimeTrackingDashboard;
