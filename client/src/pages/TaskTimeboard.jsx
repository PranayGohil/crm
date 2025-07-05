import React, { useState } from "react";
import TaskTimeboardHeader from "../components/TaskTimeboardHeader";
import SearchFilterBar from "../components/SearchFilterBar";
import TaskTimeTable from "../components/TaskTimeTable";
import TaskBoardBulkActions from "../components/TaskBoardBulkActions";

const TaskTimeboard = () => {
  const [filters, setFilters] = useState({
    client: "All Client",
    status: "Status",
    stage: "Stage",
    priority: "Prority",
  });
  const [selectedCount, setSelectedCount] = useState(0);

  return (
    <section className="task_timeboard_wrapper">
      <TaskTimeboardHeader />
      <SearchFilterBar filters={filters} setFilters={setFilters} />
      <TaskTimeTable filters={filters} onSelectionChange={setSelectedCount} />
      <TaskBoardBulkActions selectedCount={selectedCount} />
    </section>
  );
};

export default TaskTimeboard;
