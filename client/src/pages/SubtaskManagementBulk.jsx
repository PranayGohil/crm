import React from 'react';
import ClientSubtaskManagementHeader from '../components/ClientSubtaskManagementHeader';
import SubtaskFormGenerator from '../components/SubtaskFormGenerator';


const SubtaskManagementBulk = () => {
    return (
        <div className="subtask-management-bulk-page">
            <ClientSubtaskManagementHeader />
            <SubtaskFormGenerator />
        </div>
    );
};

export default SubtaskManagementBulk;
