import React, { useState } from 'react';

// TODO: Replace with API call
// const taskData = [
const taskData = [
    {
        id: 'table1',
        taskName: 'Rose Gold Bridal Necklace Set',
        totalTime: '04:40:00',
        subtasks: [
            {
                name: 'Create photorealistic...',
                stageClass: 'css-render',
                stageLabel: 'Render',
                date: '13 May 2025',
                timeSpent: '02:15:00',
                employee: {
                    name: 'Ankit Bhatt',
                    img: '/Image/Riya Sharma.png'
                }
            },
            {
                name: 'Create photorealistic...',
                stageClass: 'Cad-design',
                stageLabel: 'Cad-design',
                date: '13 May 2025',
                timeSpent: '02:15:00',
                employee: {
                    name: 'Ankit Bhatt',
                    img: '/Image/Riya Sharma.png'
                }
            },
            {
                name: 'Create photorealistic...',
                stageClass: 'css-Stone',
                stageLabel: 'Stone',
                date: '13 May 2025',
                timeSpent: '02:15:00',
                employee: {
                    name: 'Ankit Bhatt',
                    img: '/Image/Riya Sharma.png'
                }
            }
        ]
    },
    {
        id: 'table2',
        taskName: 'Rose Gold Bridal Necklace Set',
        totalTime: '04:40:00',
        subtasks: [
            {
                name: 'Create photorealistic...',
                stageClass: 'css-render',
                stageLabel: 'Render',
                date: '13 May 2025',
                timeSpent: '02:15:00',
                employee: {
                    name: 'Ankit Bhatt',
                    img: '/Image/Riya Sharma.png'
                }
            },
            {
                name: 'Create photorealistic...',
                stageClass: 'Cad-design',
                stageLabel: 'Cad-design',
                date: '13 May 2025',
                timeSpent: '02:15:00',
                employee: {
                    name: 'Ankit Bhatt',
                    img: '/Image/Riya Sharma.png'
                }
            },
            {
                name: 'Create photorealistic...',
                stageClass: 'css-Stone',
                stageLabel: 'Stone',
                date: '13 May 2025',
                timeSpent: '02:15:00',
                employee: {
                    name: 'Ankit Bhatt',
                    img: '/Image/Riya Sharma.png'
                }
            }
        ]
    },
    {
        id: 'table3',
        taskName: 'Rose Gold Bridal Necklace Set',
        totalTime: '04:40:00',
        subtasks: [
            {
                name: 'Create photorealistic...',
                stageClass: 'css-render',
                stageLabel: 'Render',
                date: '13 May 2025',
                timeSpent: '02:15:00',
                employee: {
                    name: 'Ankit Bhatt',
                    img: '/Image/Riya Sharma.png'
                }
            },
            {
                name: 'Create photorealistic...',
                stageClass: 'Cad-design',
                stageLabel: 'Cad-design',
                date: '13 May 2025',
                timeSpent: '02:15:00',
                employee: {
                    name: 'Ankit Bhatt',
                    img: '/Image/Riya Sharma.png'
                }
            },
            {
                name: 'Create photorealistic...',
                stageClass: 'css-Stone',
                stageLabel: 'Stone',
                date: '13 May 2025',
                timeSpent: '02:15:00',
                employee: {
                    name: 'Ankit Bhatt',
                    img: '/Image/Riya Sharma.png'
                }
            }
        ]
    }
];

const EttTaskTime = () => {
    const [openTable, setOpenTable] = useState(null);

    const handleToggle = (id) => {
        setOpenTable(prev => (prev === id ? null : id));
    };

    return (
        <section className="ett-task-time">
            <div className="ett-table-heading">
                <p>Main Task</p>
                <p>Total Time</p>
            </div>

            {taskData.map(task => (
                <React.Fragment key={task.id}>
                    <div className="btn_main">
                        <div
                            className={`ett-menu1 dropdown_toggle ${openTable === task.id ? 'open' : ''}`}
                            onClick={() => handleToggle(task.id)}
                        >
                            <div className="task-name">{task.taskName}</div>
                            <div className="task-time">{task.totalTime}</div>
                            <img src="SVG/header-vector.svg" alt="vec" className="arrow_icon" />
                        </div>
                    </div>

                    <table
                        id={task.id}
                        className="ett-main-task-table subtask-table"
                        style={{ display: openTable === task.id ? 'table' : 'none' }}
                    >
                        <thead>
                            <tr>
                                <th>Subtask Name</th>
                                <th>Stage</th>
                                <th>Date</th>
                                <th>Time Spent</th>
                                <th>Assigned Employees</th>
                            </tr>
                        </thead>
                        <tbody>
                            {task.subtasks.map((subtask, index) => (
                                <tr key={index}>
                                    <td>{subtask.name}</td>
                                    <td>
                                        <span className={`css-stage ${subtask.stageClass}`}>{subtask.stageLabel}</span>
                                    </td>
                                    <td>{subtask.date}</td>
                                    <td>{subtask.timeSpent}</td>
                                    <td>
                                        <span className="css-ankit">
                                            <img src={subtask.employee.img} alt="prn1" />
                                            {subtask.employee.name}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </React.Fragment>
            ))}
        </section>
    );
};

export default EttTaskTime;
