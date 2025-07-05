import React, { useState, useEffect } from "react";
import axios from "axios";

const TaskTimeTable = ({ filters, onSelectionChange }) => {
  const [projects, setProjects] = useState([]);
  const [openRow, setOpenRow] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]); // keep track of selected project IDs

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/subtask/all-tasks-projects`
        );
        console.log(res.data);
        setProjects(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  // filter projects based on filters passed from parent
  const filteredProjects = projects.filter(
    (p) =>
      (filters.client === "All Client" || p.client_name === filters.client) &&
      (filters.status === "Status" || p.status === filters.status) &&
      (filters.stage === "Stage" ||
        p.subtasks.some((s) => s.stage === filters.stage)) &&
      (filters.priority === "Prority" || p.priority === filters.priority)
  );

  const toggleSelect = (projectId) => {
    let updated;
    if (selectedIds.includes(projectId)) {
      updated = selectedIds.filter((id) => id !== projectId);
    } else {
      updated = [...selectedIds, projectId];
    }
    setSelectedIds(updated);
    onSelectionChange(updated.length);
  };

  return (
    <section className="ttb-table-main">
      <div className="time-table-wrapper">
        <table className="time-table-table">
          <thead>
            <tr>
              <th></th>
              <th></th>
              <th>Project Name</th>
              <th>Client</th>
              <th>Status</th>
              <th>Subtasks</th>
              <th>Total Time</th>
              <th>Priority</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project, idx) => (
              <React.Fragment key={project.id}>
                <tr>
                  <td>
                    <img
                      src="/SVG/arrow.svg"
                      alt="arrow"
                      className={`time-table-toggle-btn ${
                        openRow === idx ? "rotate-down" : ""
                      }`}
                      onClick={() => setOpenRow(openRow === idx ? null : idx)}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(project.id)}
                      onChange={() => toggleSelect(project.id)}
                    />
                  </td>
                  <td>{project.project_name}</td>
                  <td>{project.client}</td>
                  <td>
                    <span className="time-table-badge">{project.status}</span>
                  </td>
                  <td>{project.subtasks.length}</td>
                  <td>{project.totalTime || "-"}</td>
                  <td>
                    <span className="time-table-badge">{project.priority}</span>
                  </td>
                  <td>
                    {project.assign_date
                      ? new Date(project.assign_date).toLocaleDateString()
                      : ""}
                  </td>
                  <td>
                    {project.due_date
                      ? new Date(project.due_date).toLocaleDateString()
                      : ""}
                  </td>

                  <td className="time-table-icons">
                    <a href="EditProject">
                      <img src="/SVG/edit.svg" alt="edit" />
                    </a>
                    <a href="#">
                      <img src="/SVG/delete.svg" alt="delete" />
                    </a>
                    <a href="PreviewButton">
                      <img src="/SVG/eye-view.svg" alt="view" />
                    </a>
                  </td>
                </tr>

                {/* subtasks */}
                {openRow === idx && (
                  <tr className="time-table-subtask-row">
                    <td></td>
                    <td colSpan="10">
                      <table className="time-table-subtable">
                        <thead>
                          <tr>
                            <th></th>
                            <th>Subtask Name</th>
                            <th>Stage</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Assigned To</th>
                            <th>Time Tracked</th>
                          </tr>
                        </thead>
                        <tbody>
                          {project.subtasks.map((s, sIdx) => (
                            <tr key={sIdx}>
                              <td></td>
                              <td>{s.task_name}</td>
                              <td>{s.stage}</td>
                              <td>{s.priority}</td>
                              <td>{s.status}</td>
                              <td>{s.assignee?.name}</td>
                              <td>{s.timeTracked}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TaskTimeTable;
