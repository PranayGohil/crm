import React from 'react';
import SubtaskManagementHeader from '../components/SubtaskManagementHeader';
import AddSubtask from '../components/AddSubtask';

const SubtaskManagement = () => {
    return (
        <div className="subtask_management">
            <SubtaskManagementHeader />
            <AddSubtask />
        </div>
    );
};

export default SubtaskManagement;
