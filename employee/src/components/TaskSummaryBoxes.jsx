import React from 'react';

const TaskSummaryBoxes = () => {
    const taskStats = [
        {
            icon: 'SVG/clipboard.svg',
            alt: 'total task',
            bgClass: 'empan-bg-purple',
            label: 'Total Tasks',
            value: '34',
        },
        {
            icon: 'SVG/true-yellow.svg',
            alt: 'completed This week',
            bgClass: 'empan-bg-yellow',
            label: 'Completed This Week',
            value: '12',
        },
        {
            icon: 'SVG/time-blue.svg',
            alt: 'time logged',
            bgClass: 'empan-bg-purple',
            label: 'Time Logged (This Week)',
            value: '14h 25m',
            link: 'EmployeeTimeTracking', // Only this box is clickable
        },
    ];

    return (
        <section className="empan-boxes-main">
            <div className="empan-boxes-inner">
                {taskStats.map((item, index) => {
                    const content = (
                        <div className="empan-icon-text-box">
                            <div className={`empan-icon ${item.bgClass}`}>
                                <img src={item.icon} alt={item.alt} />
                            </div>
                            <div className="empan-text">
                                <span className="emapn-header-text">{item.label}</span>
                                <span className="emapn-main-text-number">{item.value}</span>
                            </div>
                        </div>
                    );

                    return (
                        <div key={index}>
                            {item.link ? (
                                <a href={item.link}>{content}</a>
                            ) : (
                                content
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default TaskSummaryBoxes;
