import React from 'react';

// TODO: Replace with API call
// const subtasks = [
//   {
//     name: 'Create photorealistic render of the final design',
//     description: 'Create photorealistic...',
//     stage: 'Render',
//     stageClass: 'css-render',
//     priority: 'High',
//     priorityClass: 'css-high',
//     priorityIcon: '/SVG/high-vec.svg',
//     employeeName: 'Ankit Bhatt',
//     employeeImage: '/Image/prn1.png',
//   },
//   ...
// ];

const subtasks = [
  {
    name: 'Create photorealistic render of the final design',
    description: 'Create photorealistic...',
    stage: 'Render',
    stageClass: 'css-render',
    priority: 'High',
    priorityClass: 'css-high',
    priorityIcon: '/SVG/high-vec.svg',
    employeeName: 'Ankit Bhatt',
    employeeImage: '/Image/prn1.png',
  },
  {
    name: 'Create photorealistic render of the final design',
    description: 'Create photorealistic...',
    stage: 'Cad-design',
    stageClass: 'Cad-design',
    priority: 'Medium',
    priorityClass: 'css-medium',
    priorityIcon: '/SVG/mid-vec.svg',
    employeeName: 'Ankit Bhatt',
    employeeImage: '/Image/prn1.png',
  },
  {
    name: 'Create photorealistic render of the final design',
    description: 'Create photorealistic...',
    stage: 'Render',
    stageClass: 'css-render',
    priority: 'High',
    priorityClass: 'css-high',
    priorityIcon: '/SVG/high-vec.svg',
    employeeName: 'Ankit Bhatt',
    employeeImage: '/Image/prn1.png',
  },
  {
    name: 'Create photorealistic render of the final design',
    description: 'Create photorealistic...',
    stage: 'Render',
    stageClass: 'css-render',
    priority: 'Low',
    priorityClass: 'css-low',
    priorityIcon: '/SVG/cpd-info-blue.svg',
    employeeName: 'Ankit Bhatt',
    employeeImage: '/Image/prn1.png',
  },
  {
    name: 'Create photorealistic render of the final design',
    description: 'Create photorealistic...',
    stage: 'Stone',
    stageClass: 'css-Stone',
    priority: 'High',
    priorityClass: 'css-high',
    priorityIcon: '/SVG/high-vec.svg',
    employeeName: 'Ankit Bhatt',
    employeeImage: '/Image/prn1.png',
  },
  {
    name: 'Create photorealistic render of the final design',
    description: 'Create photorealistic...',
    stage: 'Render',
    stageClass: 'css-render',
    priority: 'High',
    priorityClass: 'css-high',
    priorityIcon: '/SVG/high-vec.svg',
    employeeName: 'Ankit Bhatt',
    employeeImage: '/Image/prn1.png',
  },
  {
    name: 'Create photorealistic render of the final design',
    description: 'Create photorealistic...',
    stage: 'Render',
    stageClass: 'css-render',
    priority: 'High',
    priorityClass: 'css-high',
    priorityIcon: '/SVG/high-vec.svg',
    employeeName: 'Ankit Bhatt',
    employeeImage: '/Image/prn1.png',
  },
];

const SubtaskTable = () => {
  return (
    <section className="css-sec3">
      <div className="css-showing-subtask">
        <div className="css-table-head">
          <div className="css-table-heading css-sec2-heading">
            <input type="checkbox" />
            <p>Showing <span>124</span> Subtasks</p>
          </div>
        </div>
        <table className="subtask-table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>Subtask Name</th>
              <th>DESCIPTION OR COMMENT</th>
              <th>Stage</th>
              <th>Priority</th>
              <th>Assigned Employees</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subtasks.map((task, idx) => (
              <tr key={idx}>
                <td><input type="checkbox" /></td>
                <td className="css-td-format"><span>{task.name}</span></td>
                <td>{task.description}</td>
                <td><span className={`css-stage ${task.stageClass}`}>{task.stage}</span></td>
                <td>
                  <span className={`css-priority ${task.priorityClass}`}>
                    <img src={task.priorityIcon} alt={task.priority.toLowerCase()} />
                    {task.priority}
                  </span>
                </td>
                <td>
                  <span className="css-ankit">
                    <img src={task.employeeImage} alt="employee" />
                    {task.employeeName}
                  </span>
                </td>
                <td>
                  <span className="css-actions">
                    <a href="#"><img src="/SVG/css-edit.svg" alt="edit" /></a>
                    <a href="#"><img src="/SVG/css-delete.svg" alt="delete" /></a>
                    <a href="#"><img src="/SVG/css-eye.svg" alt="view" /></a>
                    
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

export default SubtaskTable;

