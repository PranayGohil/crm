import React, { useState, useRef, useEffect } from 'react';

// TODO: Replace with API call
const subtasks = new Array(8).fill({
    name: 'Create photorealistic render of the final design',
    description: 'Create photorealistic...',
    stage: 'Render',
    stageClass: 'css-render',
    priority: 'High',
    priorityClass: 'css-high',
    priorityIcon: '/SVG/high-vec.svg',
    employee: {
        name: 'Ankit Bhatt',
        image: '/Image/prn1.png',
    },
});

const EmployeeDropdown = ({ employee }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const handleSelect = () => setOpen(false);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`btn_main${open ? ' open' : ''}`} ref={ref}>
            <div className="dropdown_toggle" onClick={() => setOpen(!open)}>
                <span className="text_btn">
                    <span className="css-ankit">
                        <img src={employee.image} alt="emp" />
                        {employee.name}
                    </span>
                </span>
                <img src="/SVG/header-vector.svg" alt="vec" className="arrow_icon" />
            </div>
            {open && (
                <ul className="dropdown_menu">
                    {Array(3)
                        .fill(employee)
                        .map((emp, i) => (
                            <li key={i} onClick={handleSelect}>
                                <span className="css-ankit">
                                    <img src={emp.image} alt="emp" />
                                    {emp.name}
                                </span>
                            </li>
                        ))}
                </ul>
            )}
        </div>
    );
};

const ClientAdminSubtaskAssignmentTable = () => {
    return (
        <section className="sv-sec-table cpd-filters_section">
            <div className="sv-sec-table-inner css-showing-subtask">
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
                        {subtasks.map((task, index) => (
                            <tr key={index}>
                                <td><input type="checkbox" /></td>
                                <td className="css-td-format"><span>{task.name}</span></td>
                                <td>{task.description}</td>
                                <td>
                                    <span className={`css-stage ${task.stageClass}`}>{task.stage}</span>
                                </td>
                                <td>
                                    <span className={`css-priority ${task.priorityClass}`}>
                                        <img src={task.priorityIcon} alt="priority" />
                                        {task.priority}
                                    </span>
                                </td>
                                <td>
                                    <EmployeeDropdown employee={task.employee} />
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

export default ClientAdminSubtaskAssignmentTable;
