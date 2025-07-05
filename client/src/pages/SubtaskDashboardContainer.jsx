import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import TaskDetailSearchBar from "../components/TaskDetailSearchBar";
import SubtaskViewActions from "../components/SubtaskViewActions";
import SubtaskFilterBar from "../components/SubtaskFilterBar";
import SubtaskAssignmentTable from "../components/SubtaskAssignmentTable";
import BulkActionFooter from "../components/BulkActionFooter";

const SubtaskDashboardContainer = () => {
  const { projectId } = useParams();
  const [subtasks, setSubtasks] = useState([]);
  const [filters, setFilters] = useState({
    assignTo: "",
    priority: "",
    stage: "",
  });

  useEffect(() => {
    const fetchSubtasks = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/subtask/project/${projectId}`
        );
        setSubtasks(res.data);
      } catch (error) {
        console.error("Failed to fetch subtasks:", error);
      }
    };
    fetchSubtasks();
  }, [projectId]);

  // filter subtasks
  const filteredSubtasks = subtasks.filter((task) => {
    return (
      (!filters.assignTo ||
        task.asign_to?.some((a) => a.id === filters.assignTo)) &&
      (!filters.priority || task.priority === filters.priority) &&
      (!filters.stage || task.stage === filters.stage)
    );
  });

  return (
    <>
      <TaskDetailSearchBar />
      <SubtaskViewActions total={filteredSubtasks.length} />
      <SubtaskFilterBar filters={filters} setFilters={setFilters} />
      <SubtaskAssignmentTable subtasks={filteredSubtasks} />
      <BulkActionFooter />
    </>
  );
};

export default SubtaskDashboardContainer;
