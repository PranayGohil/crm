import React from 'react';
import ClientAdminSubtaskHeader from '../components/ClientAdminSubtaskHeader';
import ClientAdminSubtaskStats from '../components/ClientAdminSubtaskStats';
import ClientAdminSubtaskFilters from '../components/ClientAdminSubtaskFilters';
import ClientAdminSubtaskTable from '../components/ClientAdminSubtaskTable';

const ClientAdminSubtaskShow = () => {
    return (
        <div className="client_subtask_show_page">
            <ClientAdminSubtaskHeader />
            <ClientAdminSubtaskStats />
            <ClientAdminSubtaskFilters />
            <ClientAdminSubtaskTable />
        </div>
    );
};

export default ClientAdminSubtaskShow;
