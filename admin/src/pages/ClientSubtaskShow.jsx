import React from 'react';
import SubtaskHeader from '../components/SubtaskHeader';
import SubtaskStats from '../components/SubtaskStats';
import SubtaskFilters from '../components/SubtaskFilters';
import SubtaskTable from '../components/SubtaskTable';
import BulkActionsPanel from '../components/BulkActionsPanel';

const ClientSubtaskShow = () => {
  return (
    <div className="client_subtask_show_page">
      <SubtaskHeader />
      <SubtaskStats />
      <SubtaskFilters />
      <SubtaskTable />
      <BulkActionsPanel />
    </div>
  );
};

export default ClientSubtaskShow;
