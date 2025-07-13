import React from 'react';
import ClientAdminHeader from '../components/ClientAdminHeader';
import ClientAdminDetails from '../components/ClientAdminDetails';
import ClientAdminDetailsAndSummary from '../components/ClientAdminDetailsAndSummary';
import ClientAdminActionButtons from '../components/ClientAdminActionButtons';

const ClientAdminDetailsPage = () => {
    return (
        <div className='client_admin_admin'>
            <ClientAdminHeader />
            <ClientAdminDetails />
            <ClientAdminDetailsAndSummary />
            {/* <ClientAdminActionButtons /> */}
        </div>
    );
};

export default ClientAdminDetailsPage;
