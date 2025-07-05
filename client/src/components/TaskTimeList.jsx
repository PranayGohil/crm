import React, { useEffect } from 'react';

// TODO: Replace with API call
// const tasks = [...]; 

const tasks = [  // static sample data
    {
        id: 'table1',
        name: 'Rose Gold Bridal Necklace Set',
        time: '04:40:00',
        subtasks: [
            { name: 'Create photorealistic...', stageClass: 'css-render', stage: 'Render', date: '13 May 2025', timeSpent: '02:15:00' },
            { name: 'Create photorealistic...', stageClass: 'Cad-design', stage: 'Cad-design', date: '13 May 2025', timeSpent: '02:15:00' },
            { name: 'Create photorealistic...', stageClass: 'css-Stone', stage: 'Stone', date: '13 May 2025', timeSpent: '02:15:00' },
        ]
    },
    {
        id: 'table2',
        name: 'Rose Gold Bridal Necklace Set',
        time: '04:40:00',
        subtasks: [
            { name: 'Create photorealistic...', stageClass: 'css-render', stage: 'Render', date: '13 May 2025', timeSpent: '02:15:00' },
            { name: 'Create photorealistic...', stageClass: 'Cad-design', stage: 'Cad-design', date: '13 May 2025', timeSpent: '02:15:00' },
            { name: 'Create photorealistic...', stageClass: 'css-Stone', stage: 'Stone', date: '13 May 2025', timeSpent: '02:15:00' },
        ]
    },
    {
        id: 'table3',
        name: 'Rose Gold Bridal Necklace Set',
        time: '04:40:00',
        subtasks: [
            { name: 'Create photorealistic...', stageClass: 'css-render', stage: 'Render', date: '13 May 2025', timeSpent: '02:15:00' },
            { name: 'Create photorealistic...', stageClass: 'Cad-design', stage: 'Cad-design', date: '13 May 2025', timeSpent: '02:15:00' },
            { name: 'Create photorealistic...', stageClass: 'css-Stone', stage: 'Stone', date: '13 May 2025', timeSpent: '02:15:00' },
        ]
    },
];

const TaskTimeList = () => {
    useEffect(() => {
        const toggles = document.querySelectorAll('.dropdown_toggle');

        const handleToggleClick = (e) => {
            e.stopPropagation();

            const btnMain = e.currentTarget.closest('.btn_main');
            const targetId = e.currentTarget.getAttribute('data-target');
            const targetTable = document.getElementById(targetId);
            const isOpen = btnMain.classList.contains('open');

            document.querySelectorAll('.btn_main').forEach(btn => btn.classList.remove('open'));
            document.querySelectorAll('.subtask-table').forEach(table => (table.style.display = 'none'));

            if (!isOpen) {
                btnMain.classList.add('open');
                if (targetTable) targetTable.style.display = 'table';
            }
        };

        const handleClickOutside = () => {
            document.querySelectorAll('.btn_main').forEach(btn => btn.classList.remove('open'));
            document.querySelectorAll('.subtask-table').forEach(table => (table.style.display = 'none'));
        };

        toggles.forEach(toggle => toggle.addEventListener('click', handleToggleClick));
        document.addEventListener('click', handleClickOutside);

        return () => {
            toggles.forEach(toggle => toggle.removeEventListener('click', handleToggleClick));
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <section className="ett-task-time mg-auto mg-delete-acc">
            <div className="ett-table-heading">
                <p>Main Task</p>
                <p>Total Time</p>
            </div>

            {tasks.map(task => (
                <div key={task.id}>
                    <div className="btn_main">
                        <div className="ett-menu1 dropdown_toggle" data-target={task.id}>
                            <div className="task-name">{task.name}</div>
                            <div className="task-time">{task.time}</div>
                            <img src="SVG/header-vector.svg" alt="vec" className="arrow_icon" />
                        </div>
                    </div>

                    <table id={task.id} className="ett-main-task-table subtask-table" style={{ display: 'none' }}>
                        <thead>
                            <tr>
                                <th>Subtask Name</th>
                                <th>Stage</th>
                                <th>Date</th>
                                <th>Time Spent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {task.subtasks.map((sub, index) => (
                                <tr key={index}>
                                    <td>{sub.name}</td>
                                    <td><span className={`css-stage ${sub.stageClass}`}>{sub.stage}</span></td>
                                    <td>{sub.date}</td>
                                    <td>{sub.timeSpent}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </section>
    );
};

export default TaskTimeList;


