import React, { useState } from 'react';

// TODO: Replace with API call
// const projects = [
//   {
//     name: 'Rose Gold Bridal Necklace Set',
//     status: 'In Progress',
//     subtasks: '50/25',
//     totalTime: '05:47:12',
//     priority: 'High',
//     startDate: '12 May 2025',
//     endDate: '20 May 2025',
//     subtasksData: [
//       {
//         name: 'Initial CAD Sketch',
//         start: '12 May',
//         end: '13 May',
//         priority: 'High',
//         status: 'In Progress',
//         stage: 'CAD Design',
//         timer: '01:42:00',
//         actionIcon: '/SVG/eye-view.svg',
//         actionAlt: 'eye-view button',
//         actionType: 'pause'
//       },
//       {
//         name: '3D Rendering Pass 1',
//         start: '13 May',
//         end: '14 May',
//         priority: 'Medium',
//         status: 'To do',
//         stage: 'Render',
//         timer: '02:15:21',
//         actionIcon: '/SVG/eye-view.svg',
//         actionAlt: 'eye-view button',
//         actionType: 'start'
//       },
//       {
//         name: 'Stone Placement Planning',
//         start: '15 May',
//         end: '15 May',
//         priority: 'Low',
//         status: 'Paused',
//         stage: 'Stone',
//         timer: '00:48:33',
//         actionIcon: '/SVG/eye-view.svg',
//         actionAlt: 'eye-view button',
//         actionType: 'start'
//       },
//       {
//         name: 'Stone Placement Planning',
//         start: '15 May',
//         end: '15 May',
//         priority: 'Low',
//         status: 'Blocked',
//         stage: 'Stone',
//         timer: '00:48:33',
//         actionIcon: '/SVG/eye-view.svg',
//         actionAlt: 'eye-view button',
//         actionType: 'start'
//       },
//       {
//         name: 'Stone Placement Planning',
//         start: '15 May',
//         end: '15 May',
//         priority: 'Low',
//         status: 'Done',
//         stage: 'Stone',
//         timer: '00:48:33',
//         actionIcon: '/SVG/eye-view.svg',
//         actionAlt: 'eye-view button',
//         actionType: 'start'
//       }
//     ]
//   }
// ];

const ProjectTaskTable = () => {
    const [expanded, setExpanded] = useState(false);

    const toggleTable = () => setExpanded(!expanded);

    const projects = [
        {
            name: 'Rose Gold Bridal Necklace Set',
            status: 'In Progress',
            subtasks: '50/25',
            totalTime: '05:47:12',
            priority: 'High',
            startDate: '12 May 2025',
            endDate: '20 May 2025',
            subtasksData: [
                {
                    name: 'Initial CAD Sketch',
                    start: '12 May',
                    end: '13 May',
                    priority: 'High',
                    status: 'In Progress',
                    stage: 'CAD Design',
                    timer: '01:42:00',
                    actionType: 'pause'
                },
                {
                    name: '3D Rendering Pass 1',
                    start: '13 May',
                    end: '14 May',
                    priority: 'Medium',
                    status: 'To do',
                    stage: 'Render',
                    timer: '02:15:21',
                    actionType: 'start'
                },
                {
                    name: 'Stone Placement Planning',
                    start: '15 May',
                    end: '15 May',
                    priority: 'Low',
                    status: 'Paused',
                    stage: 'Stone',
                    timer: '00:48:33',
                    actionType: 'start'
                },
                {
                    name: 'Stone Placement Planning',
                    start: '15 May',
                    end: '15 May',
                    priority: 'Low',
                    status: 'Blocked',
                    stage: 'Stone',
                    timer: '00:48:33',
                    actionType: 'start'
                },
                {
                    name: 'Stone Placement Planning',
                    start: '15 May',
                    end: '15 May',
                    priority: 'Low',
                    status: 'Done',
                    stage: 'Stone',
                    timer: '00:48:33',
                    actionType: 'start'
                }
            ]
        }
    ];

    return (
        <section className="ttb-table-main">
            <div className="time-table-wrapper empan-time-table-wrapper">
                <table className="time-table-table">
                    <thead className="ttb-table-row">
                        <tr>
                            <th></th>
                            <th>Project Name</th>
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
                        {projects.map((project, index) => (
                            <React.Fragment key={index}>
                                <tr className="time-table-row">
                                    <td>
                                        <img
                                            src="/SVG/arrow.svg"
                                            alt="arrow"
                                            className={`time-table-toggle-btn ${expanded ? 'rotate-down' : ''}`}
                                            onClick={toggleTable}
                                        />
                                    </td>
                                    <td>{project.name}</td>
                                    <td><span className={`time-table-badge md-status-${project.status.toLowerCase().replace(' ', '-')}`}>{project.status}</span></td>
                                    <td>{project.subtasks}</td>
                                    <td>{project.totalTime}</td>
                                    <td><span className={`time-table-badge md-status-${project.priority.toLowerCase()}`}>{project.priority}</span></td>
                                    <td>{project.startDate}</td>
                                    <td>{project.endDate}</td>
                                    <td className="time-table-icons">
                                        <a href="#"><img src="/SVG/eye-view.svg" alt="eye-view button" /></a>
                                    </td>
                                </tr>
                                <tr className={`time-table-subtask-row ${expanded ? '' : 'time-table-hidden'}`}>
                                    <td colSpan="10">
                                        <table className="time-table-subtable time-table-subtable-left">
                                            <thead>
                                                <tr>
                                                    <th></th>
                                                    <th>Subtask Name</th>
                                                    <th>Start</th>
                                                    <th>End</th>
                                                    <th>Priority</th>
                                                    <th>Status</th>
                                                    <th>Stage</th>
                                                    <th>Timer</th>
                                                    <th>Time Tracked</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {project.subtasksData.map((task, i) => (
                                                    <tr key={i}>
                                                        <td></td>
                                                        <td>{task.name}</td>
                                                        <td>{task.start}</td>
                                                        <td>{task.end}</td>
                                                        <td><span className={`time-table-badge md-status-${task.priority.toLowerCase()}`}>{task.priority}</span></td>
                                                        <td><span className={`time-table-badge md-status-${task.status.toLowerCase().replace(' ', '-')}`}>{task.status}</span></td>
                                                        <td>{task.stage}</td>
                                                        <td className="ttb-table-pause">
                                                            <div className={`ttb-table-pause-inner ${task.actionType === 'pause' ? 'ttb-pause-bg-color' : 'ttb-start-bg-color'}`}>
                                                                <span className="ttb-table-pasuse-btn-containter">
                                                                    <img src={`/SVG/${task.actionType}.svg`} alt={task.actionType} />
                                                                    <span>Pause</span>
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>{task.timer}</td>
                                                        <td className="time-table-icons">
                                                            <a href="#"><img src="/SVG/eye-view.svg" alt="eye-view button" /></a>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default ProjectTaskTable;

