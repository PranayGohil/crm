import React from 'react';

// TODO: Replace with API call
const statsData = [
    { icon: '/SVG/diamond.svg', label: 'Client:', value: 'Amara Jewels', isClient: true },
    { icon: '/SVG/menu-css.svg', label: 'Total Subtasks:', value: '124' },
    { icon: '/SVG/cpd-complete.svg', label: 'Completed:', value: '68' },
    { icon: '/SVG/cpd-in_progress.svg', label: 'In Progress:', value: '42' },
    { icon: '/SVG/diamond.svg', label: 'To Do:', value: '10' },
    { icon: '/SVG/cpd-blocked.svg', label: 'Not Started:', value: '14' },
    { icon: '/SVG/diamond.svg', label: 'In Review:', value: '05' },
];

const ClientAdminSubtaskStats = () => {
    return (
        <section>
            <div className="css-sec2">
                <div className="css-sec2-inner">
                    {statsData.map((item, index) => (
                        <div className="css-name" key={index}>
                            <img src={item.icon} alt="icon" />
                            <div className={`css-sec2-heading${item.isClient ? ' css-client' : ''}`}>
                                <p>{item.label}</p>
                                <span>{item.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ClientAdminSubtaskStats;
