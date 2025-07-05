import React from 'react';
import ClientAdminNotificationPanelHeader from '../components/ClientAdminNotificationPanelHeader';
import ClientAdminNotificationList from '../components/ClientAdminNotificationList';

const ClientAdminNotificationPage = () => {
    return (
        <div className="client-admin-notification-page">
            <ClientAdminNotificationPanelHeader />
            <ClientAdminNotificationList />
        </div>
    );
};

export default ClientAdminNotificationPage;
