import React from 'react';
import NotificationHeader from '../components/NotificationHeader';
import NotificationList from '../components/NotificationList';

const NotificationAdmin = () => {
    return (
        <div className="notification-admin">
            <NotificationHeader />
            <NotificationList />
        </div>
    );
};

export default NotificationAdmin;
