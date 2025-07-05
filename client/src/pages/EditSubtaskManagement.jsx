import React from 'react';
import EditSubtaskManagementHeader from '../components/EditSubtaskManagementHeader';
import EditSubtask from '../components/EditSubtask';

const EditSubtaskManagement = () => {
    return (
        <div className="subtask_management">
            <EditSubtaskManagementHeader />
            <EditSubtask />
        </div>
    );
};

export default EditSubtaskManagement;
