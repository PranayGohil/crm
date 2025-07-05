import React from 'react';
import ClientTopBar from '../components/ClientTopBar';
import ClientMainSection from '../components/ClientMainSection';
import ProjectListSection from '../components/ProjectListSection';

const ClientProjectDetails = () => {
  return (
    <div className='project_client__client'>
      <ClientTopBar />
      <ClientMainSection />
      <ProjectListSection />
    </div>
  );
};

export default ClientProjectDetails;
