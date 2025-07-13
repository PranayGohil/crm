import React from 'react';
import ClientAdminTopBar from '../components/ClientAdminTopBar';
import ClientAdminMainSection from '../components/ClientAdminMainSection';
import ClientAdminProjectListSection from '../components/ClientAdminProjectListSection';

const ClientAdminProjectDetails = () => {
    return (
        <div className='project_client__client-main mb_40'>
            <ClientAdminTopBar />
            <ClientAdminMainSection />
            <ClientAdminProjectListSection />
        </div>
    );
};

export default ClientAdminProjectDetails;
