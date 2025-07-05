import React from 'react';
import EmployeeNotificationPanelHeader from '../components/EmployeeNotificationPanelHeader';
import EmployeeNotificationList from '../components/EmployeeNotificationList';

const EmployeeNotificationPage = () => {
    return (
        <div className="employee-notification-page">
            <EmployeeNotificationPanelHeader />
            <EmployeeNotificationList />
        </div>
    );
};

export default EmployeeNotificationPage;
