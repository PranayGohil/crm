import React from 'react';
// import TaskBoardReturn from '../components/TaskBoardReturn';
import ClientAdminProjectHeader from '../components/ClientAdminProjectHeader';
import ClientAdminTaskOverview from '../components/ClientAdminTaskOverview';
import ClientAdminTaskSubheader from '../components/ClientAdminTaskSubheader';
import ClientAdminProjectDescription from '../components/ClientAdminProjectDescription';
import ClientAdminAttachedMedia from '../components/ClientAdminAttachedMedia';
import ClientAdminCommentsSection from '../components/ClientAdminCommentsSection';
// import ClientAdminTaskFooterActions from '../components/ClientAdminTaskFooterActions';

const ClientAdminPreviewPage = () => {
    return (
        <div className="preview-page_main">
            {/* <TaskBoardReturn /> */}
            <ClientAdminProjectHeader />
            <ClientAdminTaskOverview />
            <ClientAdminTaskSubheader />
            <ClientAdminProjectDescription />
            <ClientAdminAttachedMedia />
            <ClientAdminCommentsSection />
            {/* <ClientAdminTaskFooterActions /> */}
        </div>
    );
};

export default ClientAdminPreviewPage;
