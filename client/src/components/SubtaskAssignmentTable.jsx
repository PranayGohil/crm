import React, { useState, useRef, useEffect } from "react";

const SubtaskAssignmentTable = ({ subtasks }) => {
  return (
    <section className="sv-sec-table cpd-filters_section">
      <div className="sv-sec-table-inner css-showing-subtask">
        <table className="subtask-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" />
              </th>
              <th>Subtask Name</th>
              <th>DESCRIPTION OR COMMENT</th>
              <th>Stage</th>
              <th>Priority</th>
              <th>Assigned Employees</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subtasks.map((task, index) => (
              <tr key={index}>
                <td>
                  <input type="checkbox" />
                </td>
                <td className="css-td-format">
                  <span>{task.task_name}</span>
                </td>
                <td>{task.description}</td>
                <td>
                  <span className={`css-stage`}>{task.stage}</span>
                </td>
                <td>
                  <span className={`css-priority`}>{task.priority}</span>
                </td>
                <td>
                  {/* Show first assigned employee */}
                  {task.asign_to && task.asign_to.length > 0 ? (
                    <span>{task.asign_to[0].id}</span>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>
                  <span className="css-actions">
                    <img src="/SVG/css-edit.svg" alt="edit" />
                    <img src="/SVG/css-delete.svg" alt="del" />
                    <img src="/SVG/css-eye.svg" alt="eye" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default SubtaskAssignmentTable;
