import React, { useState } from 'react';

const EmployeeNotificationList = () => {
    const [filter, setFilter] = useState('all');

    const allNotifications = [
        {
            section: 'Today',
            items: [
                {
                    icon: '/SVG/task-com-vec.svg',
                    title: 'Task Completed',
                    description: 'Riya Sharma completed subtask 3D Rendering Pass 1 on project Rose Gold Bridal Necklace Set.',
                    linkText: 'View Task',
                    linkHref: 'today.html',
                    time: '2 hours ago',
                    type: 'Task Updates',
                },
                {
                    icon: '/SVG/comment-vec.svg',
                    title: 'New Comment',
                    description: 'Arjun Patel commented on Stone Placement Planning: "Can we adjust the spacing between the stones?"',
                    linkText: 'View Comment',
                    time: '3 hours ago',
                    type: 'Comments',
                },
                {
                    icon: '/SVG/due-time-vec.svg',
                    title: 'Due Date Today',
                    description: 'Task Final Polish and Quality Check for project Diamond Studded Earrings is due today.',
                    linkText: 'View Task',
                    time: '3 hours ago',
                    type: 'Due Dates',
                },
            ],
        },
        {
            section: 'Yesterday',
            items: [
                {
                    icon: '/SVG/overdue-vec.svg',
                    title: 'Overdue Task',
                    description: 'Task CAD Model Review for project Sapphire Pendant Set is overdue by 1 day.',
                    linkText: 'View Comment',
                    linkHref: 'yesterday.html',
                    time: 'Yesterday, 14:35',
                    type: 'Due Dates',
                },
                {
                    icon: '/SVG/media-vec.svg',
                    title: 'Media Uploaded',
                    description: 'Vikram Singh uploaded 3 images to Gold Chain Manufacturing task.',
                    linkText: 'View Comment',
                    time: 'Yesterday, 14:35',
                    type: 'Media Uploads',
                    media: ['/Image/not-i1.png', '/Image/not-i2.png', '/Image/not-i1.png'],
                },
            ],
        },
        {
            section: 'Previous Week',
            items: [
                {
                    icon: '/SVG/task-edit-vec.svg',
                    title: 'Task Edited',
                    description: 'Neha Gupta updated the deadline for task Client Approval Meeting from May 25 to May 28.',
                    linkText: 'View Task',
                    linkHref: 'previous-week.html',
                    time: 'Yesterday, 14:35',
                    type: 'Task Updates',
                },
                {
                    icon: '/SVG/task-com-vec.svg',
                    title: 'Task Completed',
                    description: 'Rajesh Kumar completed task Initial Sketches for project Custom Wedding Band Set.',
                    linkText: 'View Task',
                    time: 'Yesterday, 14:35',
                    type: 'Task Updates',
                },
            ],
        },
    ];

    const filteredNotifications =
        filter === 'all'
            ? allNotifications
            : allNotifications.map((section) => ({
                ...section,
                items: section.items.filter((item) => item.type === filter),
            })).filter((section) => section.items.length > 0);

    return (
        <section className="not-sec-2">
            <div className="not-header-navbar">
                <a onClick={() => setFilter('all')} className="not-all-notification not-inner-nav" href="#">All Notifications</a>
                <a onClick={() => setFilter('Task Updates')} className="not-Task-Updates" href="#">Task Updates</a>
                <a onClick={() => setFilter('Comments')} className="not-Comments" href="#">Comments</a>
                <a onClick={() => setFilter('Due Dates')} className="not-Due-Dates" href="#">Due Dates</a>
                <a onClick={() => setFilter('Media Uploads')} className="not-Media-Uploads" href="#">Media Uploads</a>
            </div>

            <div className="not-tasks-information">
                {filteredNotifications.map((section, idx) => (
                    <div className={`not-${section.section.toLowerCase().replace(/\s/g, '-')}-tasks tasks-inner`} key={idx}>
                        <span>{section.section}</span>
                        {section.items.map((item, i) => (
                            <NotificationItem key={i} {...item} />
                        ))}
                    </div>
                ))}

                <div className="not-showing-notification">
                    <div className="not-showing-notification-txt">
                        Showing <span>1</span> to <span>7</span> of <span>28</span> notifications
                    </div>
                    <div className="not-showing-noti-btn">
                        <a href="#" className="not-previous-btn not-btn">Previous</a>
                        <a href="#" className="not-next-btn not-btn">Next</a>
                    </div>
                </div>
            </div>
        </section>
    );
};

const NotificationItem = ({ icon, title, description, linkText, linkHref = "#", time, media = [] }) => (
    <div className="not-completed-tasks">
        <div className="not-completed-img-txt">
            <img src={icon} alt={title} />
            <div className="not-completed-text">
                <div id="p1">{title}</div>
                <div id="p2">{description}</div>
                {media.length > 0 && (
                    <div className="not-media">
                        {media.map((src, index) => (
                            <img key={index} src={src} alt={`media-${index}`} />
                        ))}
                    </div>
                )}
                <a href={linkHref}>{linkText}</a>
            </div>
        </div>
        <div className="not-notification-hours">
            <img src="/SVG/dot.svg" alt="dot" />
            <span>{time}</span>
        </div>
    </div>
);

export default EmployeeNotificationList;
